import{O as $,a4 as b,k as T,j as p,g,a5 as B,C as w,a6 as j,p as q,E as _,S as C,R as L,M as x,t as z,u as X,f as W,i as F,x as m,y as M,D as h,a as H,T as J,s as Y,z as Z}from"./index-CtiUCNcL.js";import"./index-BCKzUY-q.js";const o={INVALID_PAYMENT_CONFIG:"INVALID_PAYMENT_CONFIG",INVALID_RECIPIENT:"INVALID_RECIPIENT",INVALID_ASSET:"INVALID_ASSET",INVALID_AMOUNT:"INVALID_AMOUNT",UNKNOWN_ERROR:"UNKNOWN_ERROR",UNABLE_TO_INITIATE_PAYMENT:"UNABLE_TO_INITIATE_PAYMENT",INVALID_CHAIN_NAMESPACE:"INVALID_CHAIN_NAMESPACE",GENERIC_PAYMENT_ERROR:"GENERIC_PAYMENT_ERROR",UNABLE_TO_GET_EXCHANGES:"UNABLE_TO_GET_EXCHANGES",ASSET_NOT_SUPPORTED:"ASSET_NOT_SUPPORTED",UNABLE_TO_GET_PAY_URL:"UNABLE_TO_GET_PAY_URL",UNABLE_TO_GET_BUY_STATUS:"UNABLE_TO_GET_BUY_STATUS"},N={[o.INVALID_PAYMENT_CONFIG]:"Invalid payment configuration",[o.INVALID_RECIPIENT]:"Invalid recipient address",[o.INVALID_ASSET]:"Invalid asset specified",[o.INVALID_AMOUNT]:"Invalid payment amount",[o.UNKNOWN_ERROR]:"Unknown payment error occurred",[o.UNABLE_TO_INITIATE_PAYMENT]:"Unable to initiate payment",[o.INVALID_CHAIN_NAMESPACE]:"Invalid chain namespace",[o.GENERIC_PAYMENT_ERROR]:"Unable to process payment",[o.UNABLE_TO_GET_EXCHANGES]:"Unable to get exchanges",[o.ASSET_NOT_SUPPORTED]:"Asset not supported by the selected exchange",[o.UNABLE_TO_GET_PAY_URL]:"Unable to get payment URL",[o.UNABLE_TO_GET_BUY_STATUS]:"Unable to get buy status"};class c extends Error{get message(){return N[this.code]}constructor(e,s){super(N[e]),this.name="AppKitPayError",this.code=e,this.details=s,Error.captureStackTrace&&Error.captureStackTrace(this,c)}}const Q="https://rpc.walletconnect.org/v1/json-rpc";class ee extends Error{}function te(){const t=$.getSnapshot().projectId;return`${Q}?projectId=${t}`}async function O(t,e){const s=te(),{sdkType:a,sdkVersion:r,projectId:i}=$.getSnapshot(),u={jsonrpc:"2.0",id:1,method:t,params:{...e||{},st:a,sv:r,projectId:i}},A=await(await fetch(s,{method:"POST",body:JSON.stringify(u),headers:{"Content-Type":"application/json"}})).json();if(A.error)throw new ee(A.error.message);return A}async function G(t){return(await O("reown_getExchanges",t)).result}async function ne(t){return(await O("reown_getExchangePayUrl",t)).result}async function se(t){return(await O("reown_getExchangeBuyStatus",t)).result}const ae=["eip155","solana"],re={eip155:{native:{assetNamespace:"slip44",assetReference:"60"},defaultTokenNamespace:"erc20"},solana:{native:{assetNamespace:"slip44",assetReference:"501"},defaultTokenNamespace:"token"}};function R(t,e){const{chainNamespace:s,chainId:a}=b.parseCaipNetworkId(t),r=re[s];if(!r)throw new Error(`Unsupported chain namespace for CAIP-19 formatting: ${s}`);let i=r.native.assetNamespace,u=r.native.assetReference;return e!=="native"&&(i=r.defaultTokenNamespace,u=e),`${`${s}:${a}`}/${i}:${u}`}function ie(t){const{chainNamespace:e}=b.parseCaipNetworkId(t);return ae.includes(e)}async function oe(t){const{paymentAssetNetwork:e,activeCaipNetwork:s,approvedCaipNetworkIds:a,requestedCaipNetworks:r}=t,u=T.sortRequestedNetworks(a,r).find(P=>P.caipNetworkId===e);if(!u)throw new c(o.INVALID_PAYMENT_CONFIG);if(u.caipNetworkId===s.caipNetworkId)return;const d=p.getNetworkProp("supportsAllNetworks",u.chainNamespace);if(!((a==null?void 0:a.includes(u.caipNetworkId))||d))throw new c(o.INVALID_PAYMENT_CONFIG);try{await p.switchActiveNetwork(u)}catch(P){throw new c(o.GENERIC_PAYMENT_ERROR,P)}}async function ce(t,e,s){var d;if(e!==g.CHAIN.EVM)throw new c(o.INVALID_CHAIN_NAMESPACE);if(!s.fromAddress)throw new c(o.INVALID_PAYMENT_CONFIG,"fromAddress is required for native EVM payments.");const a=typeof s.amount=="string"?parseFloat(s.amount):s.amount;if(isNaN(a))throw new c(o.INVALID_PAYMENT_CONFIG);const r=((d=t.metadata)==null?void 0:d.decimals)??18,i=w.parseUnits(a.toString(),r);if(typeof i!="bigint")throw new c(o.GENERIC_PAYMENT_ERROR);return await w.sendTransaction({chainNamespace:e,to:s.recipient,address:s.fromAddress,value:i,data:"0x"})??void 0}async function ue(t,e){if(!e.fromAddress)throw new c(o.INVALID_PAYMENT_CONFIG,"fromAddress is required for ERC20 EVM payments.");const s=t.asset,a=e.recipient,r=Number(t.metadata.decimals),i=w.parseUnits(e.amount.toString(),r);if(i===void 0)throw new c(o.GENERIC_PAYMENT_ERROR);return await w.writeContract({fromAddress:e.fromAddress,tokenAddress:s,args:[a,i],method:"transfer",abi:j.getERC20Abi(s),chainNamespace:g.CHAIN.EVM})??void 0}async function le(t,e){if(t!==g.CHAIN.SOLANA)throw new c(o.INVALID_CHAIN_NAMESPACE);if(!e.fromAddress)throw new c(o.INVALID_PAYMENT_CONFIG,"fromAddress is required for Solana payments.");const s=typeof e.amount=="string"?parseFloat(e.amount):e.amount;if(isNaN(s)||s<=0)throw new c(o.INVALID_PAYMENT_CONFIG,"Invalid payment amount.");try{if(!B.getProvider(t))throw new c(o.GENERIC_PAYMENT_ERROR,"No Solana provider available.");const r=await w.sendTransaction({chainNamespace:g.CHAIN.SOLANA,to:e.recipient,value:s,tokenMint:e.tokenMint});if(!r)throw new c(o.GENERIC_PAYMENT_ERROR,"Transaction failed.");return r}catch(a){throw a instanceof c?a:new c(o.GENERIC_PAYMENT_ERROR,`Solana payment failed: ${a}`)}}const V=0,v="unknown",n=q({paymentAsset:{network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},recipient:"0x0",amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0}),l={state:n,subscribe(t){return X(n,()=>t(n))},subscribeKey(t,e){return z(n,t,e)},async handleOpenPay(t){this.resetState(),this.setPaymentConfig(t),this.subscribeEvents(),this.initializeAnalytics(),n.isConfigured=!0,_.sendEvent({type:"track",event:"PAY_MODAL_OPEN",properties:{exchanges:n.exchanges,configuration:{network:n.paymentAsset.network,asset:n.paymentAsset.asset,recipient:n.recipient,amount:n.amount}}}),await x.open({view:"Pay"})},resetState(){n.paymentAsset={network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},n.recipient="0x0",n.amount=0,n.isConfigured=!1,n.error=null,n.isPaymentInProgress=!1,n.isLoading=!1,n.currentPayment=void 0},setPaymentConfig(t){if(!t.paymentAsset)throw new c(o.INVALID_PAYMENT_CONFIG);try{n.paymentAsset=t.paymentAsset,n.recipient=t.recipient,n.amount=t.amount,n.openInNewTab=t.openInNewTab??!0,n.redirectUrl=t.redirectUrl,n.payWithExchange=t.payWithExchange,n.error=null}catch(e){throw new c(o.INVALID_PAYMENT_CONFIG,e.message)}},getPaymentAsset(){return n.paymentAsset},getExchanges(){return n.exchanges},async fetchExchanges(){try{n.isLoading=!0;const t=await G({page:V,asset:R(n.paymentAsset.network,n.paymentAsset.asset),amount:n.amount.toString()});n.exchanges=t.exchanges.slice(0,2)}catch{throw C.showError(N.UNABLE_TO_GET_EXCHANGES),new c(o.UNABLE_TO_GET_EXCHANGES)}finally{n.isLoading=!1}},async getAvailableExchanges(t){var e;try{const s=t!=null&&t.asset&&(t!=null&&t.network)?R(t.network,t.asset):void 0;return await G({page:(t==null?void 0:t.page)??V,asset:s,amount:(e=t==null?void 0:t.amount)==null?void 0:e.toString()})}catch{throw new c(o.UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(t,e,s=!1){try{const a=Number(e.amount),r=await ne({exchangeId:t,asset:R(e.network,e.asset),amount:a.toString(),recipient:`${e.network}:${e.recipient}`});return _.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{source:"pay",exchange:{id:t},configuration:{network:e.network,asset:e.asset,recipient:e.recipient,amount:a},currentPayment:{type:"exchange",exchangeId:t},headless:s}}),s&&(this.initiatePayment(),_.sendEvent({type:"track",event:"PAY_INITIATED",properties:{source:"pay",paymentId:n.paymentId||v,configuration:{network:e.network,asset:e.asset,recipient:e.recipient,amount:a},currentPayment:{type:"exchange",exchangeId:t}}})),r}catch(a){throw a instanceof Error&&a.message.includes("is not supported")?new c(o.ASSET_NOT_SUPPORTED):new Error(a.message)}},async openPayUrl(t,e,s=!1){try{const a=await this.getPayUrl(t.exchangeId,e,s);if(!a)throw new c(o.UNABLE_TO_GET_PAY_URL);const i=t.openInNewTab??!0?"_blank":"_self";return T.openHref(a.url,i),a}catch(a){throw a instanceof c?n.error=a.message:n.error=N.GENERIC_PAYMENT_ERROR,new c(o.UNABLE_TO_GET_PAY_URL)}},subscribeEvents(){n.isConfigured||(w.subscribeKey("connections",t=>{t.size>0&&this.handlePayment()}),p.subscribeChainProp("accountState",t=>{const e=w.hasAnyConnection(g.CONNECTOR_ID.WALLET_CONNECT);t!=null&&t.caipAddress&&(e?setTimeout(()=>{this.handlePayment()},100):this.handlePayment())}))},async handlePayment(){n.currentPayment={type:"wallet",status:"IN_PROGRESS"};const t=p.getActiveCaipAddress();if(!t)return;const{chainId:e,address:s}=b.parseCaipAddress(t),a=p.state.activeChain;if(!s||!e||!a||!B.getProvider(a))return;const i=p.state.activeCaipNetwork;if(i&&!n.isPaymentInProgress)try{this.initiatePayment();const u=p.getAllRequestedCaipNetworks(),d=p.getAllApprovedCaipNetworkIds();switch(await oe({paymentAssetNetwork:n.paymentAsset.network,activeCaipNetwork:i,approvedCaipNetworkIds:d,requestedCaipNetworks:u}),await x.open({view:"PayLoading"}),a){case g.CHAIN.EVM:n.paymentAsset.asset==="native"&&(n.currentPayment.result=await ce(n.paymentAsset,a,{recipient:n.recipient,amount:n.amount,fromAddress:s})),n.paymentAsset.asset.startsWith("0x")&&(n.currentPayment.result=await ue(n.paymentAsset,{recipient:n.recipient,amount:n.amount,fromAddress:s})),n.currentPayment.status="SUCCESS";break;case g.CHAIN.SOLANA:n.currentPayment.result=await le(a,{recipient:n.recipient,amount:n.amount,fromAddress:s,tokenMint:n.paymentAsset.asset==="native"?void 0:n.paymentAsset.asset}),n.currentPayment.status="SUCCESS";break;default:throw new c(o.INVALID_CHAIN_NAMESPACE)}}catch(u){u instanceof c?n.error=u.message:n.error=N.GENERIC_PAYMENT_ERROR,n.currentPayment.status="FAILED",C.showError(n.error)}finally{n.isPaymentInProgress=!1}},getExchangeById(t){return n.exchanges.find(e=>e.id===t)},validatePayConfig(t){const{paymentAsset:e,recipient:s,amount:a}=t;if(!e)throw new c(o.INVALID_PAYMENT_CONFIG);if(!s)throw new c(o.INVALID_RECIPIENT);if(!e.asset)throw new c(o.INVALID_ASSET);if(a==null||a<=0)throw new c(o.INVALID_AMOUNT)},handlePayWithWallet(){const t=p.getActiveCaipAddress();if(!t){L.push("Connect");return}const{chainId:e,address:s}=b.parseCaipAddress(t),a=p.state.activeChain;if(!s||!e||!a){L.push("Connect");return}this.handlePayment()},async handlePayWithExchange(t){try{n.currentPayment={type:"exchange",exchangeId:t};const{network:e,asset:s}=n.paymentAsset,a={network:e,asset:s,amount:n.amount,recipient:n.recipient},r=await this.getPayUrl(t,a);if(!r)throw new c(o.UNABLE_TO_INITIATE_PAYMENT);return n.currentPayment.sessionId=r.sessionId,n.currentPayment.status="IN_PROGRESS",n.currentPayment.exchangeId=t,this.initiatePayment(),{url:r.url,openInNewTab:n.openInNewTab}}catch(e){return e instanceof c?n.error=e.message:n.error=N.GENERIC_PAYMENT_ERROR,n.isPaymentInProgress=!1,C.showError(n.error),null}},async getBuyStatus(t,e){var s,a;try{const r=await se({sessionId:e,exchangeId:t});return(r.status==="SUCCESS"||r.status==="FAILED")&&_.sendEvent({type:"track",event:r.status==="SUCCESS"?"PAY_SUCCESS":"PAY_ERROR",properties:{message:r.status==="FAILED"?T.parseError(n.error):void 0,source:"pay",paymentId:n.paymentId||v,configuration:{network:n.paymentAsset.network,asset:n.paymentAsset.asset,recipient:n.recipient,amount:n.amount},currentPayment:{type:"exchange",exchangeId:(s=n.currentPayment)==null?void 0:s.exchangeId,sessionId:(a=n.currentPayment)==null?void 0:a.sessionId,result:r.txHash}}}),r}catch{throw new c(o.UNABLE_TO_GET_BUY_STATUS)}},async updateBuyStatus(t,e){try{const s=await this.getBuyStatus(t,e);n.currentPayment&&(n.currentPayment.status=s.status,n.currentPayment.result=s.txHash),(s.status==="SUCCESS"||s.status==="FAILED")&&(n.isPaymentInProgress=!1)}catch{throw new c(o.UNABLE_TO_GET_BUY_STATUS)}},initiatePayment(){n.isPaymentInProgress=!0,n.paymentId=crypto.randomUUID()},initializeAnalytics(){n.analyticsSet||(n.analyticsSet=!0,this.subscribeKey("isPaymentInProgress",t=>{var e;if((e=n.currentPayment)!=null&&e.status&&n.currentPayment.status!=="UNKNOWN"){const s={IN_PROGRESS:"PAY_INITIATED",SUCCESS:"PAY_SUCCESS",FAILED:"PAY_ERROR"}[n.currentPayment.status];_.sendEvent({type:"track",event:s,properties:{message:n.currentPayment.status==="FAILED"?T.parseError(n.error):void 0,source:"pay",paymentId:n.paymentId||v,configuration:{network:n.paymentAsset.network,asset:n.paymentAsset.asset,recipient:n.recipient,amount:n.amount},currentPayment:{type:n.currentPayment.type,exchangeId:n.currentPayment.exchangeId,sessionId:n.currentPayment.sessionId,result:n.currentPayment.result}}})}}))}},de=W`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }
`;var E=function(t,e,s,a){var r=arguments.length,i=r<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,s):a,u;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,s,a);else for(var d=t.length-1;d>=0;d--)(u=t[d])&&(i=(r<3?u(i):r>3?u(e,s,i):u(e,s))||i);return r>3&&i&&Object.defineProperty(e,s,i),i};let y=class extends F{constructor(){var e;super(),this.unsubscribe=[],this.amount="",this.tokenSymbol="",this.networkName="",this.exchanges=l.state.exchanges,this.isLoading=l.state.isLoading,this.loadingExchangeId=null,this.connectedWalletInfo=(e=p.getAccountData())==null?void 0:e.connectedWalletInfo,this.initializePaymentDetails(),this.unsubscribe.push(l.subscribeKey("exchanges",s=>this.exchanges=s)),this.unsubscribe.push(l.subscribeKey("isLoading",s=>this.isLoading=s)),this.unsubscribe.push(p.subscribeChainProp("accountState",s=>{this.connectedWalletInfo=s==null?void 0:s.connectedWalletInfo})),l.fetchExchanges()}get isWalletConnected(){const e=p.getAccountData();return(e==null?void 0:e.status)==="connected"}render(){return m`
      <wui-flex flexDirection="column">
        <wui-flex flexDirection="column" .padding=${["0","4","4","4"]} gap="3">
          ${this.renderPaymentHeader()}

          <wui-flex flexDirection="column" gap="3">
            ${this.renderPayWithWallet()} ${this.renderExchangeOptions()}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}initializePaymentDetails(){const e=l.getPaymentAsset();this.networkName=e.network,this.tokenSymbol=e.metadata.symbol,this.amount=l.state.amount.toString()}renderPayWithWallet(){return ie(this.networkName)?m`<wui-flex flexDirection="column" gap="3">
        ${this.isWalletConnected?this.renderConnectedView():this.renderDisconnectedView()}
      </wui-flex>
      <wui-separator text="or"></wui-separator>`:m``}renderPaymentHeader(){let e=this.networkName;if(this.networkName){const a=p.getAllRequestedCaipNetworks().find(r=>r.caipNetworkId===this.networkName);a&&(e=a.name)}return m`
      <wui-flex flexDirection="column" alignItems="center">
        <wui-flex alignItems="center" gap="2">
          <wui-text variant="h1-regular" color="primary">${this.amount||"0.0000"}</wui-text>
          <wui-flex class="token-display" alignItems="center" gap="1">
            <wui-text variant="md-medium" color="primary">
              ${this.tokenSymbol||"Unknown Asset"}
            </wui-text>
            ${e?m`
                  <wui-text variant="sm-medium" color="secondary">
                    on ${e}
                  </wui-text>
                `:""}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderConnectedView(){var s,a;const e=((s=this.connectedWalletInfo)==null?void 0:s.name)||"connected wallet";return m`
      <wui-list-item
        @click=${this.onWalletPayment}
        ?chevron=${!0}
        ?fullSize=${!0}
        ?rounded=${!0}
        data-testid="wallet-payment-option"
        imageSrc=${M((a=this.connectedWalletInfo)==null?void 0:a.icon)}
      >
        <wui-text variant="lg-regular" color="primary">Pay with ${e}</wui-text>
      </wui-list-item>

      <wui-list-item
        icon="power"
        ?rounded=${!0}
        iconColor="error"
        @click=${this.onDisconnect}
        data-testid="disconnect-button"
        ?chevron=${!1}
      >
        <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
      </wui-list-item>
    `}renderDisconnectedView(){return m`<wui-list-item
      variant="icon"
      iconVariant="overlay"
      icon="wallet"
      ?rounded=${!0}
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay from wallet</wui-text>
    </wui-list-item>`}renderExchangeOptions(){return this.isLoading?m`<wui-flex justifyContent="center" alignItems="center">
        <wui-spinner size="md"></wui-spinner>
      </wui-flex>`:this.exchanges.length===0?m`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:this.exchanges.map(e=>m`
        <wui-list-item
          @click=${()=>this.onExchangePayment(e.id)}
          data-testid="exchange-option-${e.id}"
          ?chevron=${!0}
          ?disabled=${this.loadingExchangeId!==null}
          ?loading=${this.loadingExchangeId===e.id}
          imageSrc=${M(e.imageUrl)}
        >
          <wui-flex alignItems="center" gap="3">
            <wui-text flexGrow="1" variant="md-medium" color="primary"
              >Pay with ${e.name} <wui-spinner size="sm" color="secondary"></wui-spinner
            ></wui-text>
          </wui-flex>
        </wui-list-item>
      `)}onWalletPayment(){l.handlePayWithWallet()}async onExchangePayment(e){try{this.loadingExchangeId=e;const s=await l.handlePayWithExchange(e);s&&(await x.open({view:"PayLoading"}),T.openHref(s.url,s.openInNewTab?"_blank":"_self"))}catch(s){console.error("Failed to pay with exchange",s),C.showError("Failed to pay with exchange")}finally{this.loadingExchangeId=null}}async onDisconnect(e){e.stopPropagation();try{await w.disconnect()}catch{console.error("Failed to disconnect"),C.showError("Failed to disconnect")}}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}};y.styles=de;E([h()],y.prototype,"amount",void 0);E([h()],y.prototype,"tokenSymbol",void 0);E([h()],y.prototype,"networkName",void 0);E([h()],y.prototype,"exchanges",void 0);E([h()],y.prototype,"isLoading",void 0);E([h()],y.prototype,"loadingExchangeId",void 0);E([h()],y.prototype,"connectedWalletInfo",void 0);y=E([H("w3m-pay-view")],y);const pe=W`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }
`;var U=function(t,e,s,a){var r=arguments.length,i=r<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,s):a,u;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,s,a);else for(var d=t.length-1;d>=0;d--)(u=t[d])&&(i=(r<3?u(i):r>3?u(e,s,i):u(e,s))||i);return r>3&&i&&Object.defineProperty(e,s,i),i};const me=4e3;let I=class extends F{constructor(){super(),this.loadingMessage="",this.subMessage="",this.paymentState="in-progress",this.paymentState=l.state.isPaymentInProgress?"in-progress":"completed",this.updateMessages(),this.setupSubscription(),this.setupExchangeSubscription()}disconnectedCallback(){clearInterval(this.exchangeSubscription)}render(){return m`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["7","5","5","5"]}
        gap="9"
      >
        <wui-flex justifyContent="center" alignItems="center"> ${this.getStateIcon()} </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="lg-medium" color="primary">
            ${this.loadingMessage}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">
            ${this.subMessage}
          </wui-text>
        </wui-flex>
      </wui-flex>
    `}updateMessages(){var e;switch(this.paymentState){case"completed":this.loadingMessage="Payment completed",this.subMessage="Your transaction has been successfully processed";break;case"error":this.loadingMessage="Payment failed",this.subMessage="There was an error processing your transaction";break;case"in-progress":default:((e=l.state.currentPayment)==null?void 0:e.type)==="exchange"?(this.loadingMessage="Payment initiated",this.subMessage="Please complete the payment on the exchange"):(this.loadingMessage="Awaiting payment confirmation",this.subMessage="Please confirm the payment transaction in your wallet");break}}getStateIcon(){switch(this.paymentState){case"completed":return this.successTemplate();case"error":return this.errorTemplate();case"in-progress":default:return this.loaderTemplate()}}setupExchangeSubscription(){var e;((e=l.state.currentPayment)==null?void 0:e.type)==="exchange"&&(this.exchangeSubscription=setInterval(async()=>{var r,i,u;const s=(r=l.state.currentPayment)==null?void 0:r.exchangeId,a=(i=l.state.currentPayment)==null?void 0:i.sessionId;s&&a&&(await l.updateBuyStatus(s,a),((u=l.state.currentPayment)==null?void 0:u.status)==="SUCCESS"&&clearInterval(this.exchangeSubscription))},me))}setupSubscription(){l.subscribeKey("isPaymentInProgress",e=>{var s;!e&&this.paymentState==="in-progress"&&(l.state.error||!((s=l.state.currentPayment)!=null&&s.result)?this.paymentState="error":this.paymentState="completed",this.updateMessages(),setTimeout(()=>{w.state.status!=="disconnected"&&x.close()},3e3))}),l.subscribeKey("error",e=>{e&&this.paymentState==="in-progress"&&(this.paymentState="error",this.updateMessages())})}loaderTemplate(){const e=J.state.themeVariables["--w3m-border-radius-master"],s=e?parseInt(e.replace("px",""),10):4,a=this.getPaymentIcon();return m`
      <wui-flex justifyContent="center" alignItems="center" style="position: relative;">
        ${a?m`<wui-wallet-image size="lg" imageSrc=${a}></wui-wallet-image>`:null}
        <wui-loading-thumbnail radius=${s*9}></wui-loading-thumbnail>
      </wui-flex>
    `}getPaymentIcon(){var s,a;const e=l.state.currentPayment;if(e){if(e.type==="exchange"){const r=e.exchangeId;if(r){const i=l.getExchangeById(r);return i==null?void 0:i.imageUrl}}if(e.type==="wallet"){const r=(a=(s=p.getAccountData())==null?void 0:s.connectedWalletInfo)==null?void 0:a.icon;if(r)return r;const i=p.state.activeChain;if(!i)return;const u=Y.getConnectorId(i);if(!u)return;const d=Y.getConnectorById(u);return d?Z.getConnectorImage(d):void 0}}}successTemplate(){return m`<wui-icon size="xl" color="success" name="checkmark"></wui-icon>`}errorTemplate(){return m`<wui-icon size="xl" color="error" name="close"></wui-icon>`}};I.styles=pe;U([h()],I.prototype,"loadingMessage",void 0);U([h()],I.prototype,"subMessage",void 0);U([h()],I.prototype,"paymentState",void 0);I=U([H("w3m-pay-loading-view")],I);const ye=3e5;async function he(t){return l.handleOpenPay(t)}async function Ne(t,e=ye){if(e<=0)throw new c(o.INVALID_PAYMENT_CONFIG,"Timeout must be greater than 0");try{await he(t)}catch(s){throw s instanceof c?s:new c(o.UNABLE_TO_INITIATE_PAYMENT,s.message)}return new Promise((s,a)=>{let r=!1;const i=setTimeout(()=>{r||(r=!0,S(),a(new c(o.GENERIC_PAYMENT_ERROR,"Payment timeout")))},e);function u(){if(r)return;const f=l.state.currentPayment,k=l.state.error,K=l.state.isPaymentInProgress;if((f==null?void 0:f.status)==="SUCCESS"){r=!0,S(),clearTimeout(i),s({success:!0,result:f.result});return}if((f==null?void 0:f.status)==="FAILED"){r=!0,S(),clearTimeout(i),s({success:!1,error:k||"Payment failed"});return}k&&!K&&!f&&(r=!0,S(),clearTimeout(i),s({success:!1,error:k}))}const d=D("currentPayment",u),A=D("error",u),P=D("isPaymentInProgress",u),S=we([d,A,P]);u()})}function Ie(){return l.getExchanges()}function Pe(){var t;return(t=l.state.currentPayment)==null?void 0:t.result}function _e(){return l.state.error}function Te(){return l.state.isPaymentInProgress}function D(t,e){return l.subscribeKey(t,e)}function we(t){return()=>{t.forEach(e=>{try{e()}catch{}})}}const Ce={network:"eip155:8453",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},Se={network:"eip155:8453",asset:"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},be={network:"eip155:84532",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},xe={network:"eip155:1",asset:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},Ue={network:"eip155:10",asset:"0x0b2c639c533813f4aa9d7837caf62653d097ff85",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ke={network:"eip155:42161",asset:"0xaf88d065e77c8cC2239327C5EDb3A432268e5831",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},Re={network:"eip155:137",asset:"0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ve={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},De={network:"eip155:1",asset:"0xdAC17F958D2ee523a2206206994597C13D831ec7",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},Oe={network:"eip155:10",asset:"0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},Le={network:"eip155:42161",asset:"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},Me={network:"eip155:137",asset:"0xc2132d05d31c914a87c6611c10748aeb04b58e8f",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},Ye={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},Ge={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"native",metadata:{name:"Solana",symbol:"SOL",decimals:9}};export{I as W3mPayLoadingView,y as W3mPayView,ke as arbitrumUSDC,Le as arbitrumUSDT,Ce as baseETH,be as baseSepoliaETH,Se as baseUSDC,xe as ethereumUSDC,De as ethereumUSDT,Ie as getExchanges,Te as getIsPaymentInProgress,_e as getPayError,Pe as getPayResult,he as openPay,Ue as optimismUSDC,Oe as optimismUSDT,Ne as pay,Re as polygonUSDC,Me as polygonUSDT,Ge as solanaSOL,ve as solanaUSDC,Ye as solanaUSDT};
