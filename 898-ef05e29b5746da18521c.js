"use strict";(self.webpackChunkol_processed_source=self.webpackChunkol_processed_source||[]).push([[898],{6898:function(e,r,n){n.r(r),n.d(r,{default:function(){return T}});var a=n(136),t=n(6215),s=n(1120),o=n(5671),i=n(3144),f=n(8873);function c(e){var r=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,a=(0,s.Z)(e);if(r){var o=(0,s.Z)(this).constructor;n=Reflect.construct(a,arguments,o)}else n=a.apply(this,arguments);return(0,t.Z)(this,n)}}var u=new Int32Array([0,1,8,16,9,2,3,10,17,24,32,25,18,11,4,5,12,19,26,33,40,48,41,34,27,20,13,6,7,14,21,28,35,42,49,56,57,50,43,36,29,22,15,23,30,37,44,51,58,59,52,45,38,31,39,46,53,60,61,54,47,55,62,63]),l=4017,h=799,v=3406,m=2276,d=1567,p=3784,b=5793,k=2896;function w(e,r){for(var n=0,a=[],t=16;t>0&&!e[t-1];)--t;a.push({children:[],index:0});for(var s,o=a[0],i=0;i<t;i++){for(var f=0;f<e[i];f++){for((o=a.pop()).children[o.index]=r[n];o.index>0;)o=a.pop();for(o.index++,a.push(o);a.length<=i;)a.push(s={children:[],index:0}),o.children[o.index]=s.children,o=s;n++}i+1<t&&(a.push(s={children:[],index:0}),o.children[o.index]=s.children,o=s)}return a[0].children}function y(e,r,n,a,t,s,o,i,f){var c=n.mcusPerLine,l=n.progressive,h=r,v=r,m=0,d=0;function p(){if(d>0)return d--,m>>d&1;if(255===(m=e[v++])){var r=e[v++];if(r)throw new Error("unexpected marker: ".concat((m<<8|r).toString(16)))}return d=7,m>>>7}function b(e){for(var r,n=e;null!==(r=p());){if("number"==typeof(n=n[r]))return n;if("object"!=typeof n)throw new Error("invalid huffman sequence")}return null}function k(e){for(var r=e,n=0;r>0;){var a=p();if(null===a)return;n=n<<1|a,--r}return n}function w(e){var r=k(e);return r>=1<<e-1?r:r+(-1<<e)+1}var y=0;var C,P=0;function T(e,r,n,a,t){var s=n%c,o=(n/c|0)*e.v+a,i=s*e.h+t;r(e,e.blocks[o][i])}function g(e,r,n){var a=n/e.blocksPerLine|0,t=n%e.blocksPerLine;r(e,e.blocks[a][t])}var x,A,L,E,D,I,q=a.length;I=l?0===s?0===i?function(e,r){var n=b(e.huffmanTableDC),a=0===n?0:w(n)<<f;e.pred+=a,r[0]=e.pred}:function(e,r){r[0]|=p()<<f}:0===i?function(e,r){if(y>0)y--;else for(var n=s,a=o;n<=a;){var t=b(e.huffmanTableAC),i=15&t,c=t>>4;if(0===i){if(c<15){y=k(c)+(1<<c)-1;break}n+=16}else r[u[n+=c]]=w(i)*(1<<f),n++}}:function(e,r){for(var n=s,a=o,t=0;n<=a;){var i=u[n],c=r[i]<0?-1:1;switch(P){case 0:var l=b(e.huffmanTableAC),h=15&l;if(t=l>>4,0===h)t<15?(y=k(t)+(1<<t),P=4):(t=16,P=1);else{if(1!==h)throw new Error("invalid ACn encoding");C=w(h),P=t?2:3}continue;case 1:case 2:r[i]?r[i]+=(p()<<f)*c:0==--t&&(P=2===P?3:0);break;case 3:r[i]?r[i]+=(p()<<f)*c:(r[i]=C<<f,P=0);break;case 4:r[i]&&(r[i]+=(p()<<f)*c)}n++}4===P&&0==--y&&(P=0)}:function(e,r){var n=b(e.huffmanTableDC),a=0===n?0:w(n);e.pred+=a,r[0]=e.pred;for(var t=1;t<64;){var s=b(e.huffmanTableAC),o=15&s,i=s>>4;if(0===o){if(i<15)break;t+=16}else r[u[t+=i]]=w(o),t++}};var Z,z,O=0;z=1===q?a[0].blocksPerLine*a[0].blocksPerColumn:c*n.mcusPerColumn;for(var R=t||z;O<z;){for(A=0;A<q;A++)a[A].pred=0;if(y=0,1===q)for(x=a[0],D=0;D<R;D++)g(x,I,O),O++;else for(D=0;D<R;D++){for(A=0;A<q;A++){var U=x=a[A],M=U.h,j=U.v;for(L=0;L<j;L++)for(E=0;E<M;E++)T(x,I,O,L,E)}if(++O===z)break}if(d=0,(Z=e[v]<<8|e[v+1])<65280)throw new Error("marker was not found");if(!(Z>=65488&&Z<=65495))break;v+=2}return v-h}function C(e,r){var n=[],a=r.blocksPerLine,t=r.blocksPerColumn,s=a<<3,o=new Int32Array(64),i=new Uint8Array(64);function f(e,n,a){var t,s,o,i,f,c,u,w,y,C,P=r.quantizationTable,T=a;for(C=0;C<64;C++)T[C]=e[C]*P[C];for(C=0;C<8;++C){var g=8*C;0!==T[1+g]||0!==T[2+g]||0!==T[3+g]||0!==T[4+g]||0!==T[5+g]||0!==T[6+g]||0!==T[7+g]?(t=b*T[0+g]+128>>8,s=b*T[4+g]+128>>8,o=T[2+g],i=T[6+g],f=k*(T[1+g]-T[7+g])+128>>8,w=k*(T[1+g]+T[7+g])+128>>8,c=T[3+g]<<4,u=T[5+g]<<4,y=t-s+1>>1,t=t+s+1>>1,s=y,y=o*p+i*d+128>>8,o=o*d-i*p+128>>8,i=y,y=f-u+1>>1,f=f+u+1>>1,u=y,y=w+c+1>>1,c=w-c+1>>1,w=y,y=t-i+1>>1,t=t+i+1>>1,i=y,y=s-o+1>>1,s=s+o+1>>1,o=y,y=f*m+w*v+2048>>12,f=f*v-w*m+2048>>12,w=y,y=c*h+u*l+2048>>12,c=c*l-u*h+2048>>12,u=y,T[0+g]=t+w,T[7+g]=t-w,T[1+g]=s+u,T[6+g]=s-u,T[2+g]=o+c,T[5+g]=o-c,T[3+g]=i+f,T[4+g]=i-f):(y=b*T[0+g]+512>>10,T[0+g]=y,T[1+g]=y,T[2+g]=y,T[3+g]=y,T[4+g]=y,T[5+g]=y,T[6+g]=y,T[7+g]=y)}for(C=0;C<8;++C){var x=C;0!==T[8+x]||0!==T[16+x]||0!==T[24+x]||0!==T[32+x]||0!==T[40+x]||0!==T[48+x]||0!==T[56+x]?(t=b*T[0+x]+2048>>12,s=b*T[32+x]+2048>>12,o=T[16+x],i=T[48+x],f=k*(T[8+x]-T[56+x])+2048>>12,w=k*(T[8+x]+T[56+x])+2048>>12,c=T[24+x],u=T[40+x],y=t-s+1>>1,t=t+s+1>>1,s=y,y=o*p+i*d+2048>>12,o=o*d-i*p+2048>>12,i=y,y=f-u+1>>1,f=f+u+1>>1,u=y,y=w+c+1>>1,c=w-c+1>>1,w=y,y=t-i+1>>1,t=t+i+1>>1,i=y,y=s-o+1>>1,s=s+o+1>>1,o=y,y=f*m+w*v+2048>>12,f=f*v-w*m+2048>>12,w=y,y=c*h+u*l+2048>>12,c=c*l-u*h+2048>>12,u=y,T[0+x]=t+w,T[56+x]=t-w,T[8+x]=s+u,T[48+x]=s-u,T[16+x]=o+c,T[40+x]=o-c,T[24+x]=i+f,T[32+x]=i-f):(y=b*a[C+0]+8192>>14,T[0+x]=y,T[8+x]=y,T[16+x]=y,T[24+x]=y,T[32+x]=y,T[40+x]=y,T[48+x]=y,T[56+x]=y)}for(C=0;C<64;++C){var A=128+(T[C]+8>>4);n[C]=A<0?0:A>255?255:A}}for(var c=0;c<t;c++){for(var u=c<<3,w=0;w<8;w++)n.push(new Uint8Array(s));for(var y=0;y<a;y++){f(r.blocks[c][y],i,o);for(var C=0,P=y<<3,T=0;T<8;T++)for(var g=n[u+T],x=0;x<8;x++)g[P+x]=i[C++]}}return n}var P=function(){function e(){(0,o.Z)(this,e),this.jfif=null,this.adobe=null,this.quantizationTables=[],this.huffmanTablesAC=[],this.huffmanTablesDC=[],this.resetFrames()}return(0,i.Z)(e,[{key:"resetFrames",value:function(){this.frames=[]}},{key:"parse",value:function(e){var r=0;function n(){var n=e[r]<<8|e[r+1];return r+=2,n}function a(e){var r,n,a=0,t=0;for(n in e.components)e.components.hasOwnProperty(n)&&(a<(r=e.components[n]).h&&(a=r.h),t<r.v&&(t=r.v));var s=Math.ceil(e.samplesPerLine/8/a),o=Math.ceil(e.scanLines/8/t);for(n in e.components)if(e.components.hasOwnProperty(n)){r=e.components[n];for(var i=Math.ceil(Math.ceil(e.samplesPerLine/8)*r.h/a),f=Math.ceil(Math.ceil(e.scanLines/8)*r.v/t),c=s*r.h,u=o*r.v,l=[],h=0;h<u;h++){for(var v=[],m=0;m<c;m++)v.push(new Int32Array(64));l.push(v)}r.blocksPerLine=i,r.blocksPerColumn=f,r.blocks=l}e.maxH=a,e.maxV=t,e.mcusPerLine=s,e.mcusPerColumn=o}var t,s,o=n();if(65496!==o)throw new Error("SOI not found");for(o=n();65497!==o;){switch(o){case 65280:break;case 65504:case 65505:case 65506:case 65507:case 65508:case 65509:case 65510:case 65511:case 65512:case 65513:case 65514:case 65515:case 65516:case 65517:case 65518:case 65519:case 65534:var i=(t=void 0,s=void 0,t=n(),s=e.subarray(r,r+t-2),r+=s.length,s);65504===o&&74===i[0]&&70===i[1]&&73===i[2]&&70===i[3]&&0===i[4]&&(this.jfif={version:{major:i[5],minor:i[6]},densityUnits:i[7],xDensity:i[8]<<8|i[9],yDensity:i[10]<<8|i[11],thumbWidth:i[12],thumbHeight:i[13],thumbData:i.subarray(14,14+3*i[12]*i[13])}),65518===o&&65===i[0]&&100===i[1]&&111===i[2]&&98===i[3]&&101===i[4]&&0===i[5]&&(this.adobe={version:i[6],flags0:i[7]<<8|i[8],flags1:i[9]<<8|i[10],transformCode:i[11]});break;case 65499:for(var f=n()+r-2;r<f;){var c=e[r++],l=new Int32Array(64);if(c>>4==0)for(var h=0;h<64;h++){l[u[h]]=e[r++]}else{if(c>>4!=1)throw new Error("DQT: invalid table spec");for(var v=0;v<64;v++){l[u[v]]=n()}}this.quantizationTables[15&c]=l}break;case 65472:case 65473:case 65474:n();for(var m={extended:65473===o,progressive:65474===o,precision:e[r++],scanLines:n(),samplesPerLine:n(),components:{},componentsOrder:[]},d=e[r++],p=void 0,b=0;b<d;b++){p=e[r];var k=e[r+1]>>4,C=15&e[r+1],P=e[r+2];m.componentsOrder.push(p),m.components[p]={h:k,v:C,quantizationIdx:P},r+=3}a(m),this.frames.push(m);break;case 65476:for(var T=n(),g=2;g<T;){for(var x=e[r++],A=new Uint8Array(16),L=0,E=0;E<16;E++,r++)A[E]=e[r],L+=A[E];for(var D=new Uint8Array(L),I=0;I<L;I++,r++)D[I]=e[r];g+=17+L,x>>4==0?this.huffmanTablesDC[15&x]=w(A,D):this.huffmanTablesAC[15&x]=w(A,D)}break;case 65501:n(),this.resetInterval=n();break;case 65498:n();for(var q=e[r++],Z=[],z=this.frames[0],O=0;O<q;O++){var R=z.components[e[r++]],U=e[r++];R.huffmanTableDC=this.huffmanTablesDC[U>>4],R.huffmanTableAC=this.huffmanTablesAC[15&U],Z.push(R)}var M=e[r++],j=e[r++],_=e[r++],B=y(e,r,z,Z,this.resetInterval,M,j,_>>4,15&_);r+=B;break;case 65535:255!==e[r]&&r--;break;default:if(255===e[r-3]&&e[r-2]>=192&&e[r-2]<=254){r-=3;break}throw new Error("unknown JPEG marker ".concat(o.toString(16)))}o=n()}}},{key:"getResult",value:function(){var e=this.frames;if(0===this.frames.length)throw new Error("no frames were decoded");this.frames.length>1&&console.warn("more than one frame is not supported");for(var r=0;r<this.frames.length;r++)for(var n=this.frames[r].components,a=0,t=Object.keys(n);a<t.length;a++){var s=t[a];n[s].quantizationTable=this.quantizationTables[n[s].quantizationIdx],delete n[s].quantizationIdx}var o=e[0],i=o.components,f=o.componentsOrder,c=[],u=o.samplesPerLine,l=o.scanLines;for(r=0;r<f.length;r++){var h=i[f[r]];c.push({lines:C(0,h),scaleX:h.h/o.maxH,scaleY:h.v/o.maxV})}for(var v=new Uint8Array(u*l*c.length),m=0,d=0;d<l;++d)for(var p=0;p<u;++p)for(var b=0;b<c.length;++b){var k=c[b];v[m]=k.lines[0|d*k.scaleY][0|p*k.scaleX],++m}return v}}]),e}(),T=function(e){(0,a.Z)(n,e);var r=c(n);function n(e){var a;return(0,o.Z)(this,n),(a=r.call(this)).reader=new P,e.JPEGTables&&a.reader.parse(e.JPEGTables),a}return(0,i.Z)(n,[{key:"decodeBlock",value:function(e){return this.reader.resetFrames(),this.reader.parse(new Uint8Array(e)),this.reader.getResult().buffer}}]),n}(f.Z)}}]);
//# sourceMappingURL=898-ef05e29b5746da18521c.js.map