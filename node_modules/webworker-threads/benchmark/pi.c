/*

To run this:
$ gcc pi.c -pthread -o pi
./pi

*/


#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/uio.h>
#include <assert.h>
#include <unistd.h>
#include <sys/time.h>
#include <sys/signal.h>
#include <sys/wait.h>

#define kPI 5e7

typedef struct {
  int id;
  pid_t pid;
  pthread_t thread;
} threadData;




struct timeval t0;
void timer_start () {
  gettimeofday(&t0, NULL);
}

double timer_end () {
  struct timeval t1;
  gettimeofday(&t1, NULL);
  return (double) (((double)t1.tv_sec)+ ((double)t1.tv_usec*1.0e-6))- (((double)t0.tv_sec)+ ((double)t0.tv_usec*1.0e-6));
}




double pi (double n) {
  double pi= 0;
  double num= 4;
  double den= 1;
  int plus= 1;

  while (den < n) {
    if (plus) {
      pi+= num/den;
      plus= 0;
    }
    else {
      pi-= num/den;
      plus= 1;
    }
    den+= 2;
  }
  return pi;
}




void* thread_proc (void* arg) {
  fprintf(stdout, "%.16f -> TID[%d]\n", pi(kPI), ((threadData*) arg)->id);
  return NULL;
}




int main (int argc, char *argv[]) {

  double tThreads= 0, tProcs= 0;
  int numThreads= (argc > 1) ? atoi(argv[1]): 33;
  threadData* threads= (threadData*) malloc(numThreads* sizeof(threadData));
  
  
  
  // USING PROCESSES
  
  fprintf(stdout, "\n**** Using %d processes\n", numThreads);
  
  timer_start();
  
  {
    pid_t pid;
    int i= numThreads;
    while (i--) {
      threads[i].id= numThreads- i;
      threads[i].pid= pid= fork();
      if (!pid) {
        //child
        fprintf(stdout, "%.16f -> PID[%d]\n", pi(kPI), threads[i].id);
        exit(0);
      }
      else if (pid < 0) {
        fprintf(stdout, "**** Error: fork(): -1\n");
        while (++i < numThreads) {
          kill(threads[i].pid, SIGKILL);
        }
        exit(-1);
      }
    }

    i= numThreads;
    while (i--) {
      waitpid(WAIT_ANY, NULL, 0);
    }
  }

  tProcs= timer_end();
  
  
  
  
  // USING THREADS
  
  fprintf(stdout, "\n**** Using %d threads\n", numThreads);
  
  timer_start();

  {
    int i= numThreads;
    while (i--) {
      threads[i].id= numThreads- i;
      pthread_create(&threads[i].thread, NULL, thread_proc, &threads[i]);
    }

    i= numThreads;
    while (i--) {
      pthread_join(threads[i].thread, NULL);
    }
  }
  
  tThreads= timer_end();
  
  
  fprintf(stdout, "\n*** Procesos:\n");
  fprintf(stdout, "Tiempo total (ms) -> %.0f\n", tProcs*1e3);
  fprintf(stdout, "Procesos por segundo -> %.1f\n", (double)(numThreads/tProcs));
  fprintf(stdout, "Total de procesos ejecutadas -> %d\n", numThreads);
  
  fprintf(stdout, "\n*** Threads:\n");
  fprintf(stdout, "Tiempo total (ms) -> %.0f\n", tThreads*1e3);
  fprintf(stdout, "Threads por segundo -> %.1f\n", (double)(numThreads/tThreads));
  fprintf(stdout, "Total de threads ejecutadas -> %d\n", numThreads);
  
  fprintf(stdout, "\nRatio t_Threads/t_Procesos -> %.4f\n", (double)(tThreads/tProcs));
  free(threads);
}
