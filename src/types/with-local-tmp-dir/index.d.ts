declare module 'with-local-tmp-dir' {
  function withLocalTmpDir(
    fn: () => void,
  ): Promise<void>
  export = withLocalTmpDir
}
