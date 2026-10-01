const CACHE="roof-log-v4";
const CORE=["./","index.html","manifest.webmanifest","icon-180.png","https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js","https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js","https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  // App page: try network first so updates arrive, fall back to cache offline
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put("index.html",c));return r;}).catch(()=>caches.match("index.html")));
    return;
  }
  // Everything else (fonts, library, icons): cache first
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{
    if(r&&(r.ok||r.type==="opaque")){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));}
    return r;}).catch(()=>hit)));
});
