// declare module 'with-local-tmp-dir' {
//   function withLocalTmpDir(
//     fn: () => void,
//   ): Promise<void>
//   export = withLocalTmpDir
// }
declare module 'with-local-tmp-dir' {
    type CleanupContext = () => Promise<void>
    function withLocalTmpDir(callback: (options?: { dir?: string, tmpdir?: string, unsafeCleanup?: boolean }) => void): Promise<CleanupContext>
    export = withLocalTmpDir
}
