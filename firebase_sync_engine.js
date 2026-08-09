(function(){
  const API=window.History2CloudSync=window.History2CloudSync||{};
  const CFG_KEY='history2-firebase-config-v1', META_KEY='history2-sync-meta-v1', DEVICE_KEY='history2-sync-device-v1';
  const opts=window.HISTORY2_SYNC_OPTIONS||{};
  const state=API.state=Object.assign({mode:'local',configured:false,authenticated:false,email:'',uid:'',authType:'',lastSyncAt:0,error:'',offlineCache:false,protocol:location.protocol},API.state||{});
  const emit=()=>window.dispatchEvent(new CustomEvent('history2:sync-status',{detail:{...state}}));
  const setState=p=>{Object.assign(state,p);emit()};
  const raw=window.__HISTORY2_RAW_STORAGE__||{setItem:Storage.prototype.setItem,removeItem:Storage.prototype.removeItem};
  function parseConfig(v){try{if(!v)return null;const o=typeof v==='string'?JSON.parse(v):v;return o&&o.apiKey&&o.authDomain&&o.projectId&&o.appId?o:null}catch(_){return null}}
  function activeConfig(){return parseConfig(localStorage.getItem(CFG_KEY))||parseConfig(window.HISTORY2_FIREBASE_CONFIG)}
  API.getConfig=activeConfig;
  API.saveConfig=function(v){const c=parseConfig(v);if(!c)throw new Error('Firebase 설정 JSON의 apiKey, authDomain, projectId, appId를 확인하세요.');raw.setItem.call(localStorage,CFG_KEY,JSON.stringify(c));location.reload()};
  API.clearConfig=function(){raw.removeItem.call(localStorage,CFG_KEY);location.reload()};
  const config=activeConfig();
  if(!config){setState({mode:'local',configured:false,error:'Firebase 프로젝트 설정이 아직 없습니다.'});API.ready=Promise.resolve(API);return}
  setState({configured:true,mode:'connecting',error:''});
  if(location.protocol==='file:'){
    setState({mode:'local',error:'기기 간 Firebase 동기화는 HTTPS로 배포한 앱에서 활성화됩니다. 현재는 로컬 저장만 사용합니다.'});API.ready=Promise.resolve(API);return;
  }
  let resolveReady;API.ready=new Promise(r=>resolveReady=r);
  const VERSION=opts.sdkVersion||'12.16.0';
  const base=`https://www.gstatic.com/firebasejs/${VERSION}`;
  Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-firestore.js`)
  ]).then(async([appM,authM,fsM])=>{
    const app=appM.initializeApp(config);
    const auth=authM.getAuth(app);
    await authM.setPersistence(auth,authM.browserLocalPersistence);
    let db;
    try{db=fsM.initializeFirestore(app,{localCache:fsM.persistentLocalCache({tabManager:fsM.persistentMultipleTabManager()})});state.offlineCache=true}catch(e){db=fsM.getFirestore(app);state.offlineCache=false}
    const deviceId=getDeviceId();
    function getDeviceId(){let v=localStorage.getItem(DEVICE_KEY);if(!v){v='dev-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);raw.setItem.call(localStorage,DEVICE_KEY,v)}return v}
    function meta(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')}catch(_){return {}}}
    function saveMeta(m){raw.setItem.call(localStorage,META_KEY,JSON.stringify(m))}
    function shouldSync(k){return typeof k==='string'&&k.startsWith(opts.syncPrefix||'history2-')&&!k.startsWith('history2-firebase-')&&!k.startsWith('history2-sync-')}
    function keys(){const a=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(shouldSync(k))a.push(k)}return a}
    function docId(k){return btoa(unescape(encodeURIComponent(k))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
    function newest(v){let max=0;const seen=new WeakSet();function walk(x){if(!x||typeof x!=='object')return;if(seen.has(x))return;seen.add(x);if(Array.isArray(x)){x.forEach(walk);return}for(const [k,val] of Object.entries(x)){if(typeof val==='number'&&(/At$|Time$|Timestamp$|updated|created|finished|mastered|last/i.test(k))&&val>1e11)max=Math.max(max,val);else if(val&&typeof val==='object')walk(val)}}try{walk(JSON.parse(v))}catch(_){}return max}
    function unionArray(a,b){const out=[],seen=new Set();for(const x of [...a,...b]){let id='';if(x&&typeof x==='object'&&x.id!=null)id='id:'+x.id;else{try{id='v:'+JSON.stringify(x)}catch(_){id='v:'+String(x)}}if(!seen.has(id)){seen.add(id);out.push(x)}}out.sort((x,y)=>{const tx=x&&typeof x==='object'?(x.at||x.updatedAt||x.createdAt||x.lastAt||0):0,ty=y&&typeof y==='object'?(y.at||y.updatedAt||y.createdAt||y.lastAt||0):0;return tx-ty});return out}
    function mergeObj(base,other,key=''){
      if(Array.isArray(base)&&Array.isArray(other))return unionArray(base,other);
      if(base&&other&&typeof base==='object'&&typeof other==='object'&&!Array.isArray(base)&&!Array.isArray(other)){
        const out={...base};for(const k of Object.keys(other)){if(!(k in out))out[k]=other[k];else out[k]=mergeObj(out[k],other[k],k)}return out
      }
      if(typeof base==='number'&&typeof other==='number'&&(/At$|count|attempt|correct|wrong|seen|score|index|progress|total/i.test(key)))return Math.max(base,other);
      if(typeof base==='boolean'&&typeof other==='boolean')return base||other;
      return base;
    }
    function mergeValues(localV,remoteV){try{const l=JSON.parse(localV),r=JSON.parse(remoteV);const lt=newest(localV),rt=newest(remoteV);const base=lt>=rt?l:r,other=lt>=rt?r:l;return JSON.stringify(mergeObj(base,other))}catch(_){return newest(localV)>=newest(remoteV)?localV:remoteV}}
    function sharedCollection(){return fsM.collection(db,opts.sharedRootCollection||'history2SingleStudent',opts.sharedRootDocument||'main',opts.collectionName||'history2State')}
    function sharedDoc(k){return fsM.doc(db,opts.sharedRootCollection||'history2SingleStudent',opts.sharedRootDocument||'main',opts.collectionName||'history2State',docId(k))}
    async function uploadKey(uid,k){if(!shouldSync(k))return;const value=localStorage.getItem(k);if(value&&value.length>850000){console.warn('[History2Sync] skip oversized key',k,value.length);return}const m=meta(),now=Date.now();await fsM.setDoc(sharedDoc(k),{key:k,value:value??null,deleted:value==null,clientUpdatedAt:now,serverUpdatedAt:fsM.serverTimestamp(),deviceId,writerUid:uid||'',schema:opts.schema||2},{merge:true});m[k]={localUpdatedAt:now,remoteUpdatedAt:now};saveMeta(m)}
    async function flushDirty(){const u=auth.currentUser;if(!u)return;const dirty=[...(window.__HISTORY2_SYNC_DIRTY__||[])];if(!dirty.length)return;window.__HISTORY2_SYNC_DIRTY__.clear();for(const k of dirty){try{await uploadKey(u.uid,k)}catch(e){window.__HISTORY2_SYNC_DIRTY__.add(k);setState({error:'클라우드 저장 재시도 중: '+(e.code||e.message||e)})}}if(!window.__HISTORY2_SYNC_DIRTY__.size)setState({lastSyncAt:Date.now(),error:'',mode:'cloud'})}
    async function reconcile(uid){
      const snap=await fsM.getDocs(sharedCollection());const remote=new Map();snap.forEach(d=>{const x=d.data();if(x&&x.key)remote.set(x.key,x)});
      const m=meta(),all=new Set([...keys(),...remote.keys()]);let changed=false;
      window.__HISTORY2_APPLYING_REMOTE__=true;
      try{
        for(const k of all){if(!shouldSync(k))continue;const l=localStorage.getItem(k),r=remote.get(k);if(!r){if(l!=null)window.__HISTORY2_SYNC_DIRTY__.add(k);continue}
          const rt=Number(r.clientUpdatedAt||0),lm=Number(m[k]?.localUpdatedAt||newest(l||''));
          if(r.deleted&&rt>=lm){raw.removeItem.call(localStorage,k);m[k]={localUpdatedAt:rt,remoteUpdatedAt:rt};changed=true;continue}
          if(l==null&&r.value!=null){raw.setItem.call(localStorage,k,r.value);m[k]={localUpdatedAt:rt,remoteUpdatedAt:rt};changed=true;continue}
          if(l!=null&&r.value!=null&&l!==r.value){
            if(lm>rt+1500){window.__HISTORY2_SYNC_DIRTY__.add(k)}else if(rt>lm+1500){raw.setItem.call(localStorage,k,r.value);m[k]={localUpdatedAt:rt,remoteUpdatedAt:rt};changed=true}else{const merged=mergeValues(l,r.value);if(merged!==l){raw.setItem.call(localStorage,k,merged);changed=true}window.__HISTORY2_SYNC_DIRTY__.add(k)}
          }else if(r.value===l)m[k]={localUpdatedAt:Math.max(lm,rt),remoteUpdatedAt:rt};
        }
      }finally{window.__HISTORY2_APPLYING_REMOTE__=false;saveMeta(m)}
      await flushDirty();setState({lastSyncAt:Date.now(),mode:'cloud',error:''});window.dispatchEvent(new CustomEvent('history2:cloud-reconciled',{detail:{changed}}));return changed
    }
    let remoteUnsub=null,remoteTimer=null;
    function reloadAfterRemote(changed){if(!changed)return;try{const k='history2-sync-applied-v1:'+location.pathname;if(sessionStorage.getItem(k)==='1')return;sessionStorage.setItem(k,'1');setTimeout(()=>location.reload(),80)}catch(_){}}
    function watchRemote(uid){try{remoteUnsub?.()}catch(_){};remoteUnsub=fsM.onSnapshot(sharedCollection(),snap=>{let foreign=false;for(const ch of snap.docChanges()){const d=ch.doc.data();if(d&&d.deviceId&&d.deviceId!==deviceId){foreign=true;break}}if(!foreign)return;clearTimeout(remoteTimer);remoteTimer=setTimeout(async()=>{try{const changed=await reconcile(uid);if(changed&&(/parent|index/i.test(location.pathname)||document.visibilityState==='hidden'))reloadAfterRemote(true)}catch(_){}},450)},()=>{})}
    API.signOut=()=>authM.signOut(auth);
    API.syncNow=async()=>{if(!auth.currentUser)throw new Error('Firebase 자동 연결이 아직 완료되지 않았습니다.');setState({mode:'connecting'});return reconcile(auth.currentUser.uid)};
    API.flush=flushDirty;
    API.auth=auth;API.db=db;
    window.addEventListener('history2:local-dirty',()=>{clearTimeout(API._flushTimer);API._flushTimer=setTimeout(flushDirty,900)});
    window.addEventListener('online',()=>API.syncNow?.().catch(()=>{}));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')API.syncNow?.().catch(()=>{});else flushDirty().catch(()=>{})});
    setInterval(()=>flushDirty().catch(()=>{}),5000);
    authM.onAuthStateChanged(auth,async user=>{
      if(!user){try{remoteUnsub?.()}catch(_){};remoteUnsub=null;setState({mode:'connecting',authenticated:false,email:'',uid:'',authType:'anonymous',error:''});if(opts.autoAnonymousAuth!==false){try{await authM.signInAnonymously(auth);return}catch(e){setState({mode:'local',error:'Firebase 익명 연결 실패: '+(e.code||e.message||e)})}}resolveReady?.(API);resolveReady=null;return}
      setState({mode:'connecting',authenticated:true,email:'',uid:user.uid,authType:user.isAnonymous?'anonymous':'account',error:''});
      try{const changed=await reconcile(user.uid);watchRemote(user.uid);reloadAfterRemote(changed)}catch(e){setState({mode:'cloud',error:'동기화 오류: '+(e.code||e.message||e)})}
      resolveReady?.(API);resolveReady=null;
    });
  }).catch(e=>{setState({mode:'local',error:'Firebase SDK를 불러오지 못했습니다: '+(e.message||e)});resolveReady?.(API);resolveReady=null});
})();
