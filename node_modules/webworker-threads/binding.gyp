{
  'targets': [
    {
      'target_name': 'WebWorkerThreads',
      'sources': [ 'src/WebWorkerThreads.cc' ],
      'cflags!': [ '-fno-exceptions', '-DV8_USE_UNSAFE_HANDLES' ],
      'cflags_cc!': [ '-fno-exceptions', '-DV8_USE_UNSAFE_HANDLES' ],
      'include_dirs': [ '<!(node -e "require(\'nan\')")' ],
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
          }
        }]
      ]
    }
  ]
}
