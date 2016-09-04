/*
  simple thread/process benchmark

  Copyright (C) Andrew Tridgell <tridge@samba.org> 2003

  Released under the GNU GPL version 2 or later
*/

/*
  this program is designed to test the relative performance of threads/processes
  for operations typically performed by fileserving applications.
*/

#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <time.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <errno.h>
#include <signal.h>
#include <string.h>
#include <dirent.h>

#ifndef NO_THREADS
#include <pthread.h>
#endif

/* this contains per-task data */
static struct {
  char *dname;
  char *fname;
} *id_data;

/* these pipes are used for synchronised startup of the tasks */
static struct barrier {
  int fd1[2];
  int fd2[2];
} barriers[2];

/* setup a barrier */
static void barrier_setup(struct barrier *b)
{
  if (pipe(b->fd1) != 0 || pipe(b->fd2) != 0) {
    fprintf(stderr,"Barrier setup failed\n");
    exit(1);
  }
}

/* cleanup the barrier pipes */
static void barrier_cleanup(struct barrier *b)
{
  close(b->fd1[0]);
  close(b->fd1[1]);
  close(b->fd2[0]);
  close(b->fd2[1]);
}

/* wait for the parent to signal startup */
static void barrier_wait(struct barrier *b)
{
  char c = 0;

  if (write(b->fd1[1], &c, 1) != 1 ||
      read(b->fd2[0], &c, 1) != 1) {
    fprintf(stderr, "Barrier wait failed\n");
    exit(1);
  }
}

/* synchronise children. Return the amount of time since the last
   barrier */
static double barrier_parent(struct barrier *b, int nprocs)
{
  char *s = calloc(nprocs, 1);
  int i, nwritten=0;
  char c = 0;
  double t;
  static struct timeval tp1;
  struct timeval tp2;

  for (i=0;i<nprocs;i++) {
    while (read(b->fd1[0], &c, 1) != 1) ;
  }

  /* putting the timer here prevents problems with the parent getting
     rescheduled after the write */
  gettimeofday(&tp2,NULL);
  t = (tp2.tv_sec + (tp2.tv_usec*1.0e-6)) - 
    (tp1.tv_sec + (tp1.tv_usec*1.0e-6));
  gettimeofday(&tp1,NULL);

  while (nwritten != nprocs) {
    int n = write(b->fd2[1], s, nprocs-nwritten);
    if (n <= 0) {
      fprintf(stderr, "Barrier parent failed\n");
      exit(1);
    }
    nwritten += n;
  }
  free(s);
  return t;
}

#ifndef NO_THREADS
/*
  create a thread with initial function fn(private)
*/
static pthread_t thread_start(void *(*fn)(int), int id)
{
  pthread_t thread_id;
  pthread_attr_t thread_attr;
  int rc;
  typedef void *(*thread_fn_t)(void *);
  pthread_attr_init(&thread_attr);
  pthread_attr_setdetachstate(&thread_attr, 0);
  rc = pthread_create(&thread_id, &thread_attr, (thread_fn_t)fn, (void *)(intptr_t)id);
  pthread_attr_destroy(&thread_attr);

  if (rc != 0) {
    fprintf(stderr,"Thread create failed for id %d\n", id);
    exit(1);
  }

  return thread_id;
}

/* wait for a thread to exit */
static int thread_join(pthread_t id)
{
  return pthread_join(id, NULL);
}
#endif


/*
  create a process with initial function fn(private)
*/
static pid_t proc_start(void *(*fn)(int), int id)
{
  pid_t pid;

  pid = fork();
  if (pid == (pid_t)-1) {
    fprintf(stderr,"Fork failed for id %d\n", id);
    return pid;
  }
  if (pid == 0) {
    fn(id);
    exit(0);
  }
  return pid;
}

/* wait for a process to exit */
static int proc_join(pid_t id)
{
  if (waitpid(id, NULL, 0) != id) {
    return -1;
  }
  return 0;
}

#ifndef NO_THREADS
/* run a function under a set of threads */
static double run_threads(int nthreads, void *(*fn)(int ))
{
  int i;
  pthread_t *ids = calloc(sizeof(*ids), nthreads);
  double t;

  barrier_setup(&barriers[0]);
  barrier_setup(&barriers[1]);

  for (i=0;i<nthreads;i++) {
    ids[i] = thread_start(fn, i);
  }

  barrier_parent(&barriers[0], nthreads);
  t = barrier_parent(&barriers[1], nthreads);

  for (i=0;i<nthreads;i++) {
    int rc;
    rc = thread_join(ids[i]);
    if (rc != 0) {
      fprintf(stderr, "Thread %d failed : %s\n", i, strerror(errno));
      exit(1);
    }
  }

  barrier_cleanup(&barriers[0]);
  barrier_cleanup(&barriers[1]);

  free(ids);

  return t;
}
#endif

/* run a function under a set of processes */
static double run_processes(int nprocs, void *(*fn)(int ))
{
  int i;
  pid_t *ids = calloc(sizeof(*ids), nprocs);
  double t;

  barrier_setup(&barriers[0]);
  barrier_setup(&barriers[1]);

  for (i=0;i<nprocs;i++) {
    ids[i] = proc_start(fn, i);
    if (ids[i] == (pid_t)-1) {
      for (i--;i>=0;i--) {
        kill(ids[i], SIGTERM);
      }
      exit(1);
    }
  }

  barrier_parent(&barriers[0], nprocs);
  t = barrier_parent(&barriers[1], nprocs);

  for (i=0;i<nprocs;i++) {
    int rc;
    rc = proc_join(ids[i]);
    if (rc != 0) {
      fprintf(stderr, "Process %d failed : %s\n", i, strerror(errno));
      exit(1);
    }
  }

  barrier_cleanup(&barriers[0]);
  barrier_cleanup(&barriers[1]);

  free(ids);

  return t;
}



/***********************************************************************
  a simple malloc speed test using a wide variety of malloc sizes
************************************************************************/
static void *test_malloc(int id)
{
#define NMALLOCS 200
  int i, j;
  void *ptrs[NMALLOCS];

  barrier_wait(&barriers[0]);

  for (j=0;j<500;j++) {
    for (i=1;i<NMALLOCS;i++) {
      ptrs[i] = malloc(i*128);
      if (!ptrs[i]) {
        printf("malloc(%d) failed!\n", i);
        exit(1);
      }
    }
    for (i=1;i<NMALLOCS;i++) {
      free(ptrs[i]);
    }
  }

  barrier_wait(&barriers[1]);
  return NULL;
}

/***********************************************************************
  a simple setreuid speed test
************************************************************************/
static void *test_setreuid(int id)
{
  int i;
  void *ptrs[NMALLOCS];

  barrier_wait(&barriers[0]);
  if (getuid() != 0) {
    if (id == 0) {
      printf("Skipping setreuid test for non-root user\n");
    }
    barrier_wait(&barriers[1]);
    return NULL;
  }


  for (i=0;i<2000;i++) {
    if (setreuid(-1, 1) != 0 ||
        setreuid(-1, 0) != 0) {
      printf("setreuid failed: %s\n", strerror(errno));
      barrier_wait(&barriers[1]);
      return NULL;
    }
  }

  barrier_wait(&barriers[1]);
  return NULL;
}


/***********************************************************************
 simple read/write testing using /dev/null and /dev/zero
************************************************************************/
static void *test_readwrite(int id)
{
  int i;
  int fd_in, fd_out;
  /* we use less than 1 page to prevent page table games */
  char buf[32];

  barrier_wait(&barriers[0]);

  fd_in = open("/dev/zero", O_RDONLY);
  fd_out = open("/dev/null", O_WRONLY);
  if (fd_in == -1 || fd_out == -1) {
    fprintf(stderr,"Failed to open /dev/zero or /dev/null\n");
    exit(1);
  }

  for (i=0;i<100000;i++) {
    if (read(fd_in, buf, sizeof(buf)) != sizeof(buf) ||
        write(fd_out, buf, sizeof(buf)) != sizeof(buf)) {
      fprintf(stderr,"IO failed at loop %d\n", i);
      exit(1);
    }
  }

  close(fd_in);
  close(fd_out);
  
  barrier_wait(&barriers[1]);

  return NULL;
}


/***********************************************************************
test stat() operations
************************************************************************/
static void *test_stat(int id)
{
  int i;

  barrier_wait(&barriers[0]);

  for (i=0;i<30000;i++) {
    struct stat st;
    if (stat(id_data[id].dname, &st) != 0) goto failed;
    if (stat(id_data[id].fname, &st) == 0) goto failed;
  }

  barrier_wait(&barriers[1]);

  return NULL;

failed:
  fprintf(stderr,"stat failed\n");
  exit(1);
}

/***********************************************************************
test fstat() operations
************************************************************************/
static void *test_fstat(int id)
{
  int i, fd;

  barrier_wait(&barriers[0]);

  fd = open(id_data[id].fname, O_RDWR|O_CREAT, 0600);
  if (fd == -1) goto failed;

  for (i=0;i<1000000;i++) {
    struct stat st;
    if (fstat(fd, &st) != 0) goto failed;
  }

  close(fd);
  unlink(id_data[id].fname);

  barrier_wait(&barriers[1]);

  return NULL;

failed:
  fprintf(stderr,"fstat failed\n");
  exit(1);
}

/***********************************************************************
test directory operations
************************************************************************/
static void *test_dir(int id)
{
        int i;

  barrier_wait(&barriers[0]);

        for (i=0;i<2000;i++) {
                DIR *d = opendir(id_data[id].dname);
                if (!d) goto failed;
                while (readdir(d)) {} ;
                closedir(d);
        }

  barrier_wait(&barriers[1]);
        return NULL;

failed: 
        fprintf(stderr,"dir failed\n");
        exit(1);
}

/***********************************************************************
test directory operations
************************************************************************/
static void *test_dirsingle(int id)
{
        int i;

  barrier_wait(&barriers[0]);

        for (i=0;i<2000;i++) {
                DIR *d = opendir(".");
                if (!d) goto failed;
                while (readdir(d)) {} ;
                closedir(d);
        }

  barrier_wait(&barriers[1]);
        return NULL;

failed: 
        fprintf(stderr,"dirsingle failed\n");
        exit(1);
}


/***********************************************************************
test create/unlink operations
************************************************************************/
static void *test_create(int id)
{
  int i;

  barrier_wait(&barriers[0]);

  for (i=0;i<3000;i++) {
    int fd;
    fd = open(id_data[id].fname, O_CREAT|O_TRUNC|O_RDWR, 0666);
    if (fd == -1) goto failed;
    if (open(id_data[id].fname, O_CREAT|O_TRUNC|O_RDWR|O_EXCL, 0666) != -1) goto failed;
    close(fd);
    if (unlink(id_data[id].fname) != 0) goto failed;
  }
  
  barrier_wait(&barriers[1]);
  return NULL;

failed:
  fprintf(stderr,"create failed\n");
  exit(1);
}


/***********************************************************************
test fcntl lock operations
************************************************************************/
static void *test_lock(int id)
{
  int i;
  int fd;

  barrier_wait(&barriers[0]);

  fd = open(id_data[id].fname, O_CREAT|O_RDWR, 0666);
  if (fd == -1) goto failed;
  unlink(id_data[id].fname);

  for (i=0;i<20000;i++) {
    struct flock lock;
    lock.l_type = F_WRLCK;
    lock.l_whence = SEEK_SET;
    lock.l_start = (id*100) + (i%100);
    lock.l_len = 1;
    lock.l_pid = 0;
  
    if (fcntl(fd,F_SETLK,&lock) != 0) goto failed;

    lock.l_type = F_UNLCK;

    if (fcntl(fd,F_SETLK,&lock) != 0) goto failed;
  }

  close(fd);
  
  barrier_wait(&barriers[1]);
  return NULL;

failed:
  fprintf(stderr,"lock failed\n");
  exit(1);
}

/***********************************************************************
do nothing!
************************************************************************/
static void *test_noop(int id)
{
  barrier_wait(&barriers[0]);
  barrier_wait(&barriers[1]);
  return NULL;
}


/*
  show the average and range of a set of results
*/
static void show_result(const char *name, double *t, int nrepeats)
{
  double mint, maxt, total;
  int i;
  total = mint = maxt = t[0];
  for (i=1;i<nrepeats;i++) {
    if (t[i] < mint) mint = t[i];
    if (t[i] > maxt) maxt = t[i];
    total += t[i];
  }
  printf("%s  %5.2f +/- %.2f seconds\n", name, total/nrepeats, (maxt-mint)/2);
}


/* lock a byte range in a open file */
int main(int argc, char *argv[])
{
  int nprocs, i;
  char *tname = "ALL";
#define NREPEATS 10
  struct {
    const char *name;
    void *(*fn)(int );
  } tests[] = {
    {"noop", test_noop},
    {"malloc", test_malloc},
    {"setreuid", test_setreuid},
    {"readwrite", test_readwrite},
    {"stat", test_stat},
    {"fstat", test_fstat},
    {"dir", test_dir},
    {"dirsingle", test_dirsingle},
    {"create", test_create},
    {"lock", test_lock},
    {NULL, NULL}
  };

  if (argc <= 1) {
    printf("thread_perf NPROCS\n");
    exit(1);
  }

  nprocs = atoi(argv[1]);

  if (argc > 2) {
    tname = argv[2];
  }

  id_data = calloc(nprocs, sizeof(*id_data));
  if (!id_data) {
    exit(1);
  }

#ifndef NO_THREADS
  printf("NOTE! for accurate process results please compile with -DNO_THREADS and don't link to -lpthread\n\n");
#endif

  for (i=0;i<nprocs;i++) {
    char s[30];
    sprintf(s, "testd_%d", i);
    id_data[i].dname = strdup(s);

    sprintf(s, "%s/test.dat", id_data[i].dname);
    id_data[i].fname = strdup(s);

    rmdir(id_data[i].dname);
    if (mkdir(id_data[i].dname, 0777) != 0) {
      fprintf(stderr, "Failed to create %s\n", id_data[i].dname);
      exit(1);
    }

    unlink(id_data[i].fname);
  }

  for (i=0;tests[i].name;i++) {
    double t_threads[NREPEATS];
    double t_processes[NREPEATS];
    int j;

    if (strcasecmp(tname, "ALL") && strcasecmp(tests[i].name, tname)) {
      continue;
    }

    printf("Running test '%s' with %d tasks\n", tests[i].name, nprocs);

    for (j=0;j<NREPEATS;j++) {
#ifndef NO_THREADS
      t_threads[j]   = run_threads(nprocs, tests[i].fn);
#endif
      t_processes[j] = run_processes(nprocs, tests[i].fn);
    }
#ifndef NO_THREADS
    show_result("Threads  ", t_threads, NREPEATS);
#endif
    show_result("Processes", t_processes, NREPEATS);

    printf("\n");
    fflush(stdout);
  }

  for (i=0;i<nprocs;i++) {
    if (rmdir(id_data[i].dname) != 0) {
      fprintf(stderr, "Failed to delete %s\n", id_data[i].dname);
      exit(1);
    }
  }

  for (i=0;i<nprocs;i++) {
    free(id_data[i].dname);
    free(id_data[i].fname);
  }
  free(id_data);

  return 0;
}