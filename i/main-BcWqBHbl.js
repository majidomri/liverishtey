import{m as n}from"./vendor-BP9wXJlQ.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function s(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(e){if(e.ep)return;e.ep=!0;const r=s(e);fetch(e.href,r)}})();const c=[{id:"MM001",createdAt:"2024-02-15",priority:"urgent",title:"Software Engineer Seeking Life Partner",description:"Passionate software developer with a love for technology and outdoor activities. Looking for someone who shares similar interests and values.",education:"masters",gender:"male",contact:{whatsapp:"+1234567890",phone:"+1234567890",audioMessage:"../dist/audio/chimes.mp3"}},{id:"MM002",createdAt:"2024-02-14",priority:"regular",title:"Creative Artist Looking for Soulmate",description:"Professional artist with a creative spirit. Seeking someone who appreciates art and culture.",education:"bachelors",gender:"female",contact:{whatsapp:"+0987654321",audioMessage:"/audio/message2.mp3"}},{id:"MM003",createdAt:"2024-02-13",priority:"urgent",title:"Medical Professional Seeking Partnership",description:"Dedicated doctor looking for a meaningful relationship with someone who understands work-life balance.",education:"phd",gender:"female",contact:{phone:"+1122334455",audioMessage:"/audio/message3.mp3"}},{id:"MM004",createdAt:"2024-02-12",priority:"regular",title:"Entrepreneur Looking for Adventure",description:"Successful business owner seeking someone to share life's adventures and build a future together.",education:"bachelors",gender:"male",contact:{whatsapp:"+5544332211",phone:"+5544332211",audioMessage:"/audio/message4.mp3"}},{id:"MM005",createdAt:"2024-02-12",priority:"regular",title:"Entrepreneur Looking for Adventure",description:"Successful business owner seeking someone to share life's adventures and build a future together.",education:"bachelors",gender:"male",contact:{whatsapp:"+5544332211",phone:"+5544332211",audioMessage:"/audio/message4.mp3"}},{id:"MM006",createdAt:"2024-02-12",priority:"regular",title:"Entrepreneur Looking for Adventure",description:"Successful business owner seeking someone to share life's adventures and build a future together.",education:"bachelors",gender:"male",contact:{whatsapp:"+5544332211",phone:"+5544332211",audioMessage:"/audio/message4.mp3"}},{id:"MM007",createdAt:"2024-02-12",priority:"regular",title:"Entrepreneur Looking for Adventure",description:"Successful business owner seeking someone to share life's adventures and build a future together.",education:"bachelors",gender:"male",contact:{whatsapp:"+5544332211",phone:"+5544332211",audioMessage:"/audio/message4.mp3"}},{id:"MM008",createdAt:"2024-02-12",priority:"regular",title:"Entrepreneur Looking for Adventure",description:"Successful business owner seeking someone to share life's adventures and build a future together.",education:"bachelors",gender:"male",contact:{whatsapp:"+5544332211",phone:"+5544332211",audioMessage:"/audio/message4.mp3"}},{id:"MM009",createdAt:"2024-02-12",priority:"regular",title:"Entrepreneur Looking for Adventure",description:"Successful business owner seeking someone to share life's adventures and build a future together.",education:"bachelors",gender:"male",contact:{whatsapp:"+5544332211",phone:"+5544332211",audioMessage:"/audio/message4.mp3"}},{id:"MM0010",createdAt:"2024-02-12",priority:"regular",title:"Entrepreneur Looking for Adventure",description:"Successful business owner seeking someone to share life's adventures and build a future together.",education:"bachelors",gender:"male",contact:{whatsapp:"+5544332211",phone:"+5544332211",audioMessage:"/audio/message4.mp3"}},{id:"MM0011",createdAt:"2024-02-12",priority:"regular",title:"Entrepreneur Looking for Adventure",description:"Successful business owner seeking someone to share life's adventures and build a future together.",education:"bachelors",gender:"male",contact:{whatsapp:"+5544332211",phone:"+5544332211",audioMessage:"/audio/message4.mp3"}}];function l(i){return{isPlaying:!1,currentTime:0,duration:0,audio:null,progressCircle:{radius:16,circumference:2*Math.PI*16},init(){this.audio=new Audio(i),this.audio.addEventListener("loadedmetadata",()=>{this.duration=this.audio.duration}),this.audio.addEventListener("timeupdate",()=>{this.currentTime=this.audio.currentTime}),this.audio.addEventListener("ended",()=>{this.isPlaying=!1,this.currentTime=0})},togglePlay(){this.isPlaying?this.audio.pause():this.audio.play(),this.isPlaying=!this.isPlaying},formatTime(t){const s=Math.floor(t/60),o=Math.floor(t%60);return`${s}:${o.toString().padStart(2,"0")}`},getProgress(){if(!this.duration)return 0;const t=this.currentTime/this.duration*this.progressCircle.circumference;return this.progressCircle.circumference-t}}}window.Alpine=n;n.data("matchmaking",()=>({searchQuery:"",filters:{education:"",gender:"",priority:""},profiles:c,filteredProfiles:[],drawerOpen:!1,page:1,perPage:20,hasMore:!0,loading:!1,sortOrder:"dateDesc",activeAudio:null,init(){this.filterProfiles(),this.setupInfiniteScroll(),this.prefetchAudioFiles()},clearAllFilters(){this.searchQuery="",this.filters={education:"",gender:"",priority:""},this.resetPagination()},setupInfiniteScroll(){window.addEventListener("scroll",()=>{window.innerHeight+window.scrollY>=document.body.offsetHeight-500&&!this.loading&&this.hasMore&&this.loadMore()})},loadMore(){this.loading||!this.hasMore||(this.page++,this.filterProfiles(!0))},resetPagination(){this.page=1,this.hasMore=!0,this.filterProfiles()},filterProfiles(i=!1){i||(this.loading=!0);let t=this.profiles.filter(e=>{const r=e.title.toLowerCase().includes(this.searchQuery.toLowerCase())||e.description.toLowerCase().includes(this.searchQuery.toLowerCase()),a=!this.filters.education||e.education===this.filters.education,u=!this.filters.gender||e.gender===this.filters.gender,d=!this.filters.priority||e.priority===this.filters.priority;return r&&a&&u&&d});t.sort((e,r)=>{switch(this.sortOrder){case"dateDesc":return new Date(r.createdAt)-new Date(e.createdAt);case"dateAsc":return new Date(e.createdAt)-new Date(r.createdAt);case"userUrgent":return e.priority!=="urgent"&&r.priority!=="urgent"?0:e.priority==="urgent"&&r.priority!=="urgent"?-1:e.priority!=="urgent"&&r.priority==="urgent"?1:new Date(r.createdAt)-new Date(e.createdAt);default:return this.calculateRelevance(r)-this.calculateRelevance(e)}}),this.sortOrder==="userUrgent"&&(t=t.filter(e=>e.priority==="urgent"));const s=0,o=this.page*this.perPage;this.hasMore=o<t.length,this.filteredProfiles=t.slice(s,o),this.loading=!1},calculateRelevance(i){if(!this.searchQuery)return 0;const t=this.searchQuery.toLowerCase();let s=0;return i.title.toLowerCase().includes(t)&&(s+=3),i.description.toLowerCase().includes(t)&&(s+=2),s},toggleDrawer(){this.drawerOpen=!this.drawerOpen},prefetchAudioFiles(){this.profiles.forEach(i=>{i.contact.audioMessage&&prefetchAudio(i.contact.audioMessage)})},stopAllAudio(){document.querySelectorAll("audio").forEach(i=>{if(!i.paused){i.pause(),i.currentTime=0;const t=i.parentElement.querySelector("button i");t&&t.classList.replace("fa-pause","fa-play")}}),this.activeAudio=null},toggleAudio(i){const t=document.getElementById(`audio-${i}`);this.activeAudio===i?(t.pause(),this.activeAudio=null):(this.stopAllAudio(),t.play(),this.activeAudio=i,t.onended=()=>{this.activeAudio=null})}}));n.data("audioPlayer",l);n.start();
//# sourceMappingURL=main-BcWqBHbl.js.map