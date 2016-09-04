#include <stdlib.h>
#include <stdio.h>

int main (int argc, char* argv[]) {
  #include "test.include.c"
  printf("%s\n\n", _test);
  return 0;
}