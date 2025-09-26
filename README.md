Console Error

A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


  ...
    <InnerScrollAndFocusHandler segmentPath={[...]} focusAndScrollRef={{apply:false, ...}}>
      <ErrorBoundary errorComponent={undefined} errorStyles={undefined} errorScripts={undefined}>
        <LoadingBoundary loading={null}>
          <HTTPAccessFallbackBoundary notFound={undefined} forbidden={undefined} unauthorized={undefined}>
            <RedirectBoundary>
              <RedirectErrorBoundary router={{...}}>
                <InnerLayoutRouter url="/upload" tree={[...]} cacheNode={{lazyData:null, ...}} segmentPath={[...]}>
                  <ClientPageRoot Component={function Home} searchParams={{}} params={{}}>
                    <Home params={Promise} searchParams={Promise}>
                      <div className="min-h-scre..." style={{...}}>
                        <header>
                        <div className="border-b p..." style={{...}}>
                          <div className="max-w-7xl ...">
                            <div className="flex justi...">
                              <input>
                              <button
                                onClick={function handleSaveEmail}
                                className="px-4 py-2 text-sm rounded-lg transition-colors"
                                style={{backgroundColor:"#f05d43",color:"#FFFFFF"}}
-                               fdprocessedid="ir6wke"
                              >
+                               Continue
                        <main ref={{current:null}} className="flex-1 flex">
                          <div className="flex-1 fle...">
                            <div className="text-cente...">
                              <div className="bg-white r..." style={{...}}>
                                <h3>
                                <div className="flex items...">
                                  <input>
                                  <button
                                    onClick={function handleSaveEmail}
                                    className="px-6 py-3 font-medium rounded-lg transition-all hover:shadow-sm"
                                    style={{backgroundColor:"#8FA8A8",color:"#FFFFFF"}}
-                                   fdprocessedid="zrserk"
                                  >
+                                   Continue
                                ...
                        ...
                  ...
app\upload\page.tsx (638:15) @ Home


  636 |                 suppressHydrationWarning={true}
  637 |               />
> 638 |               <button
      |               ^
  639 |                 onClick={handleSaveEmail}
  640 |                 className="px-4 py-2 text-sm rounded-lg transition-colors"
  641 |                 style={{ backgroundColor: '#f05d43', color: '#FFFFFF' }}
Call Stack
19

Show 17 ignore-listed frame(s)
button
<anonymous>
Home
app\upload\page.tsx (638:15)