(function () {
  'use strict';
  var chartInstance = null;
  var COLORS = {cashflow:'#22c55e',equity:'#3b82f6',debt:'#ef4444',propertyValue:'#eab308',breakEven:'#a855f7'};
  var form = document.getElementById('calcForm');
  var chartCanvas = document.getElementById('chart');
  function initTheme(){var s=localStorage.getItem('immo-theme');document.body.setAttribute('data-theme',s||'dark');}
  function toggleTheme(){var c=document.body.getAttribute('data-theme'),n=c==='dark'?'light':'dark';document.body.setAttribute('data-theme',n);localStorage.setItem('immo-theme',n);if(chartInstance)run();}
  function initHeaderScroll(){var h=document.getElementById('mainHeader');window.addEventListener('scroll',function(){if(window.scrollY>120)h.classList.add('compact');else h.classList.remove('compact');},{passive:true});}
  function formatEuroDisplay(v){if(v===''||v==null)return'';var c=String(v).replace(/[^\d]/g,'');if(c==='')return'';return c.replace(/\B(?=(\d{3})+(?!\d))/g,' ');}
  function parseEuroInput(str){if(!str)return 0;return parseFloat(String(str).replace(/\s/g,''))||0;}
  function bindNumberFormatting(){document.querySelectorAll('input[data-format="euro"]').forEach(function(i){i.value=formatEuroDisplay(i.value);i.addEventListener('blur',function(){var r=parseEuroInput(i.value);if(!isNaN(r)&&r!==0)i.value=formatEuroDisplay(r);});i.addEventListener('focus',function(){var r=parseEuroInput(i.value);if(r>0)i.value=r;setTimeout(function(){i.select();},50);});i.addEventListener('input',function(){i.value=i.value.replace(/[^\d\s]/g,'');});});}
  function getInputs(){var g=function(id){return parseFloat(document.getElementById(id).value.replace(/\s/g,''))||0;};return{purchasePrice:g('purchasePrice'),appreciationRate:g('appreciationRate')/100,monthlyRent:g('monthlyRent'),rentIncrease:g('rentIncrease')/100,grunderwerbsteuer:g('grunderwerbsteuer')/100,notar:g('notar')/100,makler:g('makler')/100,downPayment:g('downPayment'),interestRate:g('interestRate')/100,tilgung:g('tilgung')/100,hausgeld:g('hausgeld'),grundsteuer:g('grundsteuer'),insurance:g('insurance'),maintenanceRate:g('maintenanceRate')/100,taxRate:g('taxRate')/100,afaRate:g('afaRate')/100,buildingRatio:g('buildingRatio')/100,holdingPeriod:g('holdingPeriod')};}
  function calculate(inp){var t=inp.purchasePrice*(1+inp.grunderwerbsteuer+inp.notar+inp.makler),la=Math.max(0,t-inp.downPayment),ap=la*(inp.interestRate+inp.tilgung),mp=ap/12,yr=inp.holdingPeriod,d=[],pv=inp.purchasePrice,rl=la,cc=-inp.downPayment,tc=inp.downPayment,r=inp.monthlyRent*12;d.push({year:0,propertyValue:pv,remainingLoan:rl,equity:pv-rl,cumulativeCashflow:cc,netWorth:pv-rl+cc,rent:0,loanInterest:0,loanRepayment:0,maintenance:0,hausgeld:0,grundsteuer:0,insurance:0,taxEffect:0,netCashflow:-inp.downPayment,totalCapitalInjected:tc});for(var y=1;y<=yr;y++){pv*=1+inp.appreciationRate;if(y>1)r*=1+inp.rentIncrease;var m=pv*inp.maintenanceRate,h=y===1?inp.hausgeld*12:d[y-1].hausgeld*1.01,g=y===1?inp.grundsteuer:d[y-1].grundsteuer*1.01,i=y===1?inp.insurance:d[y-1].insurance*1.01;var li=0,lr=0;if(rl>0){li=rl*inp.interestRate;lr=Math.min(ap-li,rl);if(lr<0)lr=0;rl-=lr;}var a=inp.purchasePrice*inp.buildingRatio*inp.afaRate,ti=r-m-h-g-i-li-a,te=ti*inp.taxRate,ncf=r-(li+lr)-m-h-g-i-te;cc+=ncf;if(ncf<0)tc+=Math.abs(ncf);var eq=pv-Math.max(0,rl),nw=eq+cc;d.push({year:y,propertyValue:Math.round(pv),remainingLoan:Math.round(Math.max(0,rl)),equity:Math.round(eq),cumulativeCashflow:Math.round(cc),netWorth:Math.round(nw),rent:Math.round(r),loanInterest:Math.round(li),loanRepayment:Math.round(lr),maintenance:Math.round(m),hausgeld:Math.round(h),grundsteuer:Math.round(g),insurance:Math.round(i),afa:Math.round(a),taxableIncome:Math.round(ti),taxEffect:Math.round(te),netCashflow:Math.round(ncf),totalCapitalInjected:Math.round(tc)});}return{data:d,monthlyPayment:mp,totalAcqCost:t,loanAmount:la};}
  function fmtEur(v){var a=Math.abs(v).toLocaleString('de-DE',{maximumFractionDigits:0});return(v<0?'−€':'€')+a;}
  function fmtPercent(v){return v.toFixed(1)+'%';}
  function fmtEurPerMonth(v){return fmtEur(v)+'/月';}
  function findBreakEvenYear(d){for(var i=0;i<d.length;i++){if(d[i].netWorth>=0)return d[i].year;}return null;}
  function updateHeaderKPI(ar,be,nw){var e1=document.getElementById('hdrKpiAnnualROI'),e2=document.getElementById('hdrKpiBreakEven'),e3=document.getElementById('hdrKpiFinalEquity');if(e1){e1.textContent=fmtPercent(ar);e1.className='h-kpi-value '+(ar>=0?'positive':'negative');}if(e2){e2.textContent=be!==null?'第'+be+'年':'未达到';}if(e3){e3.textContent=fmtEur(nw);e3.className='h-kpi-value '+(nw>=0?'positive':'negative');}}
  function renderKPI(d,mp,tac){var la=d[d.length-1],fi=d[0],pr=la.netWorth-fi.netWorth,tc=la.totalCapitalInjected,yr=d.length-1,sr=tc>0?(pr/tc)*100:0,ar=0;if(yr>0&&tc>0){var f=1+sr/100;ar=f>0?(Math.pow(f,1/yr)-1)*100:0;}var be=findBreakEvenYear(d);setKPI('kpiTotalInvestment',fmtEur(tac));setKPI('kpiMonthlyPayment',fmtEurPerMonth(mp));setKPI('kpiAnnualROI',fmtPercent(ar),ar>=0?'positive':'negative');setKPI('kpiBreakEvenYear',be!==null?'第 '+be+' 年':'未达到');setKPI('kpiFinalEquity',fmtEur(la.equity),la.equity>=0?'positive':'negative');setKPI('kpiTotalReturn',fmtEur(la.netWorth),la.netWorth>=0?'positive':'negative');updateHeaderKPI(ar,be,la.netWorth);}
  function setKPI(id,v,c){var el=document.getElementById(id);if(!el)return;el.textContent=v;el.className='kpi-value'+(c?' '+c:'');}
  var breakEvenPlugin={id:'breakEvenLine',afterDraw:function(chart){var yr=chart.options.plugins&&chart.options.plugins.breakEvenLine&&chart.options.plugins.breakEvenLine.year;if(yr==null)return;var meta=chart.getDatasetMeta(3);if(!meta||!meta.data||meta.data.length===0||yr<0||yr>=meta.data.length)return;var ctx=chart.ctx,xs=chart.scales.x,ys=chart.scales.y,x=xs.getPixelForValue(yr);ctx.save();ctx.beginPath();ctx.setLineDash([6,4]);ctx.strokeStyle=COLORS.breakEven;ctx.lineWidth=2;ctx.moveTo(x,ys.top);ctx.lineTo(x,ys.bottom);ctx.stroke();ctx.setLineDash([]);var label='✨ 第'+yr+'年';ctx.font='bold 12px Inter, system-ui, sans-serif';var tw=ctx.measureText(label).width,ly=ys.top-10;ctx.fillStyle=COLORS.breakEven+'22';ctx.beginPath();ctx.roundRect(x-tw/2-8,ly-14,tw+16,22,6);ctx.fill();ctx.strokeStyle=COLORS.breakEven;ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=COLORS.breakEven;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,ly-3);var pt=meta.data[yr];if(pt){ctx.beginPath();ctx.fillStyle=COLORS.breakEven;ctx.moveTo(pt.x,pt.y-6);ctx.lineTo(pt.x-7,pt.y-20);ctx.lineTo(pt.x+7,pt.y-20);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(pt.x,pt.y,5,0,Math.PI*2);ctx.fillStyle='#ffffff';ctx.fill();ctx.strokeStyle=COLORS.breakEven;ctx.lineWidth=2.5;ctx.stroke();}ctx.restore();}};
  Chart.register(breakEvenPlugin);



  function renderChart(data){var bey=findBreakEvenYear(data),labels=data.map(function(d){return d.year===0?'0 (买入)':String(d.year);});var dk=document.body.getAttribute('data-theme')!=='light';var gc=dk?'#1e293b':'#e2e8f0',tc=dk?'#64748b':'#64748b',tl=dk?'#94a3b8':'#475569',lc=dk?'#94a3b8':'#334155';var ds=[{label:'累计净现金流 (Kum. Cashflow)',data:data.map(function(d){return d.cumulativeCashflow;}),borderColor:COLORS.cashflow,fill:false,tension:0.3,pointRadius:2,borderWidth:2},{label:'房屋净值 (Eigenkapital)',data:data.map(function(d){return d.equity;}),borderColor:COLORS.equity,fill:false,tension:0.3,pointRadius:2,borderWidth:2},{label:'剩余贷款 (Restschuld)',data:data.map(function(d){return d.remainingLoan;}),borderColor:COLORS.debt,fill:false,tension:0.3,pointRadius:2,borderWidth:2,borderDash:[5,5]},{label:'总净资产 (Gesamtvermögen)',data:data.map(function(d){return d.netWorth;}),borderColor:COLORS.propertyValue,fill:false,tension:0.3,pointRadius:2,borderWidth:2.5}];var cfg={type:'line',data:{labels:labels,datasets:ds},options:{responsive:true,maintainAspectRatio:true,aspectRatio:1.6,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom',labels:{color:lc,boxWidth:14,padding:16,font:{family:'Inter',size:11}}},tooltip:{backgroundColor:dk?'#1e293b':'#ffffff',borderColor:dk?'#475569':'#cbd5e1',borderWidth:1,padding:10,titleFont:{family:'Inter',size:12},bodyFont:{family:'Inter',size:12},titleColor:dk?'#f1f5f9':'#1e293b',bodyColor:dk?'#94a3b8':'#475569',callbacks:{label:function(ctx){return ctx.dataset.label+': '+fmtEur(ctx.raw);}}},breakEvenLine:{year:bey}},scales:{x:{title:{display:true,text:'年份 (Jahr)',color:tl,font:{family:'Inter',size:12}},ticks:{color:tc,font:{family:'Inter',size:11}},grid:{color:gc}},y:{title:{display:true,text:'金额 (€)',color:tl,font:{family:'Inter',size:12}},ticks:{color:tc,font:{family:'Inter',size:11},callback:function(v){if(Math.abs(v)>=1e6)return(v/1e6).toFixed(1)+'M';if(Math.abs(v)>=1000)return(v/1e3).toFixed(0)+'k';return v;}},grid:{color:gc}}}}};if(chartInstance)chartInstance.destroy();chartInstance=new Chart(chartCanvas,cfg);}

  function renderTable(data){var th=document.querySelector('#dataTable thead'),tb=document.querySelector('#dataTable tbody');if(!th||!tb)return;var cols=[{key:'year',label:'年份'},{key:'propertyValue',label:'房价'},{key:'remainingLoan',label:'剩余贷款'},{key:'equity',label:'房屋净值'},{key:'cumulativeCashflow',label:'累计现金流'},{key:'netWorth',label:'总净资产'},{key:'rent',label:'租金收入'},{key:'loanInterest',label:'贷款利息'},{key:'loanRepayment',label:'本金偿还'},{key:'netCashflow',label:'年度净现金流'}];th.innerHTML='<tr>'+cols.map(function(c){return'<th>'+c.label+'</th>';}).join('')+'</tr>';tb.innerHTML=data.map(function(row){return'<tr>'+cols.map(function(c){var v=row[c.key];return'<td>'+(c.key==='year'?String(v):fmtEur(v))+'</td>';}).join('')+'</tr>';}).join('');}

  function clampDownPayment(){var pp=parseFloat(document.getElementById('purchasePrice').value.replace(/\s/g,''))||0;var dp=document.getElementById('downPayment');var dv=parseFloat(dp.value.replace(/\s/g,''))||0;if(pp>0&&dv>pp){dp.value=pp;var f=dp.getAttribute('data-format');if(f==='euro')dp.value=formatEuroDisplay(pp);}}
  function run(){clampDownPayment();var inp=getInputs();if(inp.downPayment>=inp.purchasePrice*(1+inp.grunderwerbsteuer+inp.notar+inp.makler)){alert('首付金额超过总购房成本！');return;}var result=calculate(inp);renderKPI(result.data,result.monthlyPayment,result.totalAcqCost);renderChart(result.data);renderTable(result.data);}

  var paramRanges={};
  var paramMeta={purchasePrice:{label:'购买价格',unit:'€',min:100000,max:1000000,step:10000,optimal:'lower'},appreciationRate:{label:'年增值率',unit:'%',min:0,max:8,step:0.5,optimal:'higher'},monthlyRent:{label:'月租金',unit:'€',min:200,max:5000,step:50,optimal:'higher'},rentIncrease:{label:'年租金涨幅',unit:'%',min:0,max:5,step:0.5,optimal:'higher'},grunderwerbsteuer:{label:'Grunderwerbsteuer',unit:'%',min:0,max:7,step:0.5,optimal:'lower'},notar:{label:'Notar+Grundbuch',unit:'%',min:0,max:4,step:0.5,optimal:'lower'},makler:{label:'Makler',unit:'%',min:0,max:7,step:0.5,optimal:'lower'},downPayment:{label:'首付',unit:'€',min:0,max:200000,step:5000,optimal:'optimize'},interestRate:{label:'贷款利率',unit:'%',min:1,max:8,step:0.25,optimal:'lower'},tilgung:{label:'初始Tilgung',unit:'%',min:0.5,max:10,step:0.5,optimal:'optimize'},hausgeld:{label:'Hausgeld',unit:'€/月',min:0,max:1000,step:25,optimal:'lower'},grundsteuer:{label:'Grundsteuer',unit:'€/年',min:0,max:2000,step:50,optimal:'lower'},insurance:{label:'房屋保险',unit:'€/年',min:0,max:2000,step:50,optimal:'lower'},maintenanceRate:{label:'维修储备',unit:'%/年',min:0,max:5,step:0.5,optimal:'lower'},taxRate:{label:'所得税率',unit:'%',min:0,max:50,step:5,optimal:'lower'},afaRate:{label:'AfA折旧率',unit:'%',min:0,max:5,step:0.5,optimal:'higher'},buildingRatio:{label:'建筑占比',unit:'%',min:0,max:100,step:5,optimal:'higher'},holdingPeriod:{label:'持有年限',unit:'年',min:1,max:60,step:1,optimal:'higher'}};

  function optimizeParam(pid,minV,maxV){var base=JSON.parse(JSON.stringify(getInputs()));var steps=30,bestNw=-Infinity,bestV=0,pctKeys=['appreciationRate','rentIncrease','grunderwerbsteuer','notar','makler','interestRate','tilgung','maintenanceRate','taxRate','afaRate','buildingRatio'];for(var s=0;s<=steps;s++){var tv=minV+(maxV-minV)*s/steps;var test=JSON.parse(JSON.stringify(base));if(pctKeys.indexOf(pid)>=0)tv=tv/100;test[pid]=tv;if(test.downPayment>=test.purchasePrice*(1+test.grunderwerbsteuer+test.notar+test.makler))continue;var r=calculate(test),nw=r.data[r.data.length-1].netWorth;if(nw>bestNw){bestNw=nw;bestV=pid.indexOf('Rate')>=0||pctKeys.indexOf(pid)>=0?tv*100:tv;}}return{value:bestV,netWorth:bestNw};}

  function openModal(pid){var m=paramMeta[pid];if(!m)return;var modal=document.getElementById('rangeModal');document.getElementById('modalTitle').textContent='\uD83C\uDF9A\uFE0F '+m.label+' \u8303\u56F4\u4F18\u5316';var hint='\u8BBE\u7F6E\u8303\u56F4\u540E\u70B9\u51FB\u201C\u4F18\u5316\u8BA1\u7B97\u201D\uFF0C';hint+=m.optimal==='lower'?'\u8BE5\u53C2\u6570\u8D8A\u4F4E\u56DE\u62A5\u8D8A\u9AD8':m.optimal==='higher'?'\u8BE5\u53C2\u6570\u8D8A\u9AD8\u56DE\u62A5\u8D8A\u9AD8':'\u6709\u6700\u4F18\u503C\u4F7F\u56DE\u62A5\u6700\u5927';document.getElementById('modalHint').textContent=hint;var cv=parseFloat(document.getElementById(pid).value.replace(/\s/g,''))||0;document.getElementById('modalCurrentVal').textContent=cv+' '+m.unit;var saved=paramRanges[pid];document.getElementById('modalMin').value=saved?saved.min:m.min;var maxVal=saved?saved.max:m.max;if(pid==='downPayment'){var pp=parseFloat(document.getElementById('purchasePrice').value.replace(/\s/g,''))||0;if(pp>0&&maxVal>pp)maxVal=pp;}document.getElementById('modalMax').value=maxVal;document.getElementById('modalOptResult').style.display='none';modal.style.display='flex';modal.dataset.param=pid;modal.dataset.unit=m.unit;}

  function closeModal(){document.getElementById('rangeModal').style.display='none';}
  function saveCurrentRanges(){var md=document.getElementById('rangeModal'),pid=md.dataset.param;if(!pid)return;var mn=parseFloat(document.getElementById('modalMin').value);var mx=parseFloat(document.getElementById('modalMax').value);if(!isNaN(mn)&&!isNaN(mx))paramRanges[pid]={min:mn,max:mx};}

  form.addEventListener('submit',function(e){e.preventDefault();run();});
  document.getElementById('headerCalcBtn').addEventListener('click',function(e){e.preventDefault();run();});
  document.addEventListener('DOMContentLoaded',function(){initTheme();initHeaderScroll();bindNumberFormatting();applyLang();document.getElementById('themeToggle').addEventListener('click',toggleTheme);document.getElementById('langToggle').addEventListener('click',toggleLang);document.getElementById('shareBtn').addEventListener('click',buildShareCard);document.querySelectorAll('.btn-range').forEach(function(b){b.addEventListener('click',function(){openModal(b.dataset.param);});});document.getElementById('modalCloseBtn').addEventListener('click',closeModal);document.getElementById('rangeModal').addEventListener('click',function(e){if(e.target===this)closeModal();});document.getElementById('modalOptimizeBtn').addEventListener('click',function(){saveCurrentRanges();var md=document.getElementById('rangeModal'),pid=md.dataset.param,u=md.dataset.unit;var mn=parseFloat(document.getElementById('modalMin').value)||0;var mx=parseFloat(document.getElementById('modalMax').value)||100;if(mn>=mx){alert(t('alert_range'));return;}var res=optimizeParam(pid,mn,mx);var me=paramMeta[pid];var dv=me.min>=1?Math.round(res.value):res.value.toFixed(me.step<0.1?2:1);document.getElementById('modalOptVal').textContent=tf('modal_optval',dv,u);document.getElementById('modalOptNote').textContent=tf('modal_optnw',fmtEur(res.netWorth));document.getElementById('modalOptResult').style.display='block';});
document.getElementById('modalMin').addEventListener('input',saveCurrentRanges);
document.getElementById('modalMax').addEventListener('input',saveCurrentRanges);
document.getElementById('purchasePrice').addEventListener('input',function(){clampDownPayment();});
document.getElementById('downPayment').addEventListener('input',function(){clampDownPayment();});
run();});

  // ============================
  // i18n — Multi-Language
  // ============================
  var LANG_DATA = {};
  LANG_DATA['cn'] = {
    calc:'计算', subtitle:'德国投资公寓收益周期曲线模拟器',
    footer:'ImmoCalculator — 仅供投资参考，不构成财务建议。',
    kpi_inv:'总投资额',kpi_monthly:'月供',kpi_roi:'年化 ROI',kpi_be:'盈亏平衡年',kpi_finalEq:'终期净资产',kpi_totalNw:'总净资产',
    hdr_roi:'年化 ROI',hdr_be:'盈亏平衡',hdr_eq:'终期净资产',
    be_reached:'第{0}年',be_none:'未达到',
    table_year:'年份',table_pv:'房价',table_rl:'剩余贷款',table_eq:'房屋净值',table_cc:'累计现金流',table_nw:'总净资产',
    table_rent:'租金收入',table_int:'贷款利息',table_repay:'本金偿还',table_cf:'年度净现金流',
    chart_cf:'累计净现金流 (Kum. Cashflow)',chart_eq:'房屋净值 (Eigenkapital)',chart_debt:'剩余贷款 (Restschuld)',chart_nw:'总净资产 (Gesamtvermögen)',
    chart_x:'年份 (Jahr)',chart_y:'金额 (€)',chart_buy:'0 (买入)',chart_be:'✨ 第{0}年',
    modal_title:'范围优化',modal_hint:'设置范围后点击"优化计算"。',modal_hint_lower:'该参数越低回报越高',modal_hint_higher:'该参数越高回报越高',modal_hint_opt:'有最优值使回报最大',
    modal_cur:'当前值：',modal_min:'最小值',modal_max:'最大值',modal_opt:'优化计算',
    modal_optval:'最优值：{0} {1}',modal_optnw:'对应总净资产：{0}',
    alert_dp:'首付金额超过总购房成本！',alert_range:'最小值必须小于最大值',
    share_title:'ImmoCalculator 参数与结果',
    share_save:'保存图片',
    param_labels:{purchasePrice:'购买价格',appreciationRate:'年增值率',monthlyRent:'月租金',rentIncrease:'年租金涨幅',grunderwerbsteuer:'Grunderwerbsteuer',notar:'Notar+Grundbuch',makler:'Makler',downPayment:'首付',interestRate:'贷款利率',tilgung:'Tilgung',hausgeld:'Hausgeld',grundsteuer:'Grundsteuer',insurance:'房屋保险',maintenanceRate:'维修储备',taxRate:'所得税率',afaRate:'AfA折旧率',buildingRatio:'建筑占比',holdingPeriod:'持有年限'}
  };
  LANG_DATA['de'] = {
    calc:'Berechnen',subtitle:'Rendite-Simulator für Immobilien in DE',
    footer:'ImmoCalculator — Keine Anlageberatung.',
    kpi_inv:'Gesamtkosten',kpi_monthly:'Annuität',kpi_roi:'Jährl. ROI',kpi_be:'Break-Even',kpi_finalEq:'Eigenkapital',kpi_totalNw:'Gesamtvermögen',
    hdr_roi:'Jährl. ROI',hdr_be:'Break-Even',hdr_eq:'Eigenkapital',
    be_reached:'Jahr {0}',be_none:'N/A',
    table_year:'Jahr',table_pv:'Preis',table_rl:'Restschuld',table_eq:'EK',table_cc:'Cashflow',table_nw:'Vermögen',
    table_rent:'Miete',table_int:'Zinsen',table_repay:'Tilgung',table_cf:'Netto-CF',
    chart_cf:'Kum. Cashflow',chart_eq:'Eigenkapital',chart_debt:'Restschuld',chart_nw:'Gesamtvermögen',
    chart_x:'Jahr',chart_y:'Betrag (€)',chart_buy:'0 (Kauf)',chart_be:'✨ Jahr {0}',
    modal_title:'Parameterbereich',modal_hint:'Bereich einstellen und optimieren. ',modal_hint_lower:'Niedriger = besser',modal_hint_higher:'Höher = besser',modal_hint_opt:'Optimaler Wert vorhanden',
    modal_cur:'Aktuell: ',modal_min:'Minimum',modal_max:'Maximum',modal_opt:'Optimieren',
    modal_optval:'Optimal: {0} {1}',modal_optnw:'Vermögen: {0}',
    alert_dp:'EK übersteigt Gesamtkosten!',alert_range:'Min < Max erforderlich',
    share_title:'ImmoCalculator — Parameter & Ergebnisse',
    share_save:'Bild speichern',
    param_labels:{purchasePrice:'Kaufpreis',appreciationRate:'Wertsteigerung',monthlyRent:'Kaltmiete',rentIncrease:'Mietsteigerung',grunderwerbsteuer:'Grunderwerbsteuer',notar:'Notar+Grundbuch',makler:'Makler',downPayment:'Eigenkapital',interestRate:'Sollzins',tilgung:'Tilgung',hausgeld:'Hausgeld',grundsteuer:'Grundsteuer',insurance:'Versicherung',maintenanceRate:'Instandhaltung',taxRate:'Steuersatz',afaRate:'AfA',buildingRatio:'Gebäudeanteil',holdingPeriod:'Haltedauer'}
  };
  LANG_DATA['en'] = {
    calc:'Calculate',subtitle:'German Investment Property ROI Simulator',
    footer:'ImmoCalculator — Not financial advice.',
    kpi_inv:'Total Cost',kpi_monthly:'Ann. Payment',kpi_roi:'Annual ROI',kpi_be:'Break-Even',kpi_finalEq:'Final Equity',kpi_totalNw:'Net Worth',
    hdr_roi:'Annual ROI',hdr_be:'Break-Even',hdr_eq:'Final Equity',
    be_reached:'Year {0}',be_none:'N/A',
    table_year:'Year',table_pv:'Value',table_rl:'Rem. Debt',table_eq:'Equity',table_cc:'Cum. CF',table_nw:'Net Worth',
    table_rent:'Rent',table_int:'Interest',table_repay:'Repayment',table_cf:'Net CF',
    chart_cf:'Cum. Cashflow',chart_eq:'Equity',chart_debt:'Rem. Debt',chart_nw:'Net Worth',
    chart_x:'Year',chart_y:'Amount (€)',chart_buy:'0 (Purchase)',chart_be:'✨ Year {0}',
    modal_title:'Range Opt.',modal_hint:'Set range and optimize. ',modal_hint_lower:'Lower = better',modal_hint_higher:'Higher = better',modal_hint_opt:'Optimal value exists',
    modal_cur:'Current: ',modal_min:'Minimum',modal_max:'Maximum',modal_opt:'Optimize',
    modal_optval:'Optimal: {0} {1}',modal_optnw:'Net Worth: {0}',
    alert_dp:'DP exceeds total cost!',alert_range:'Min must be < Max',
    share_title:'ImmoCalculator — Parameters & Results',
    share_save:'Save Image',
    param_labels:{purchasePrice:'Purchase Price',appreciationRate:'Appreciation',monthlyRent:'Monthly Rent',rentIncrease:'Rent Increase',grunderwerbsteuer:'Grunderwerbsteuer',notar:'Notar+Grundbuch',makler:'Broker Fee',downPayment:'Down Payment',interestRate:'Interest Rate',tilgung:'Repayment',hausgeld:'Hausgeld',grundsteuer:'Property Tax',insurance:'Insurance',maintenanceRate:'Maintenance',taxRate:'Tax Rate',afaRate:'AfA Deprec.',buildingRatio:'Building %',holdingPeriod:'Holding Period'}
  };

  var lang = localStorage.getItem('immo-lang') || 'cn';
  function t(key) { var d = LANG_DATA[lang], p = key.split('.'), v = d; for (var i=0; i<p.length; i++) { v = v[p[i]]; if (v===undefined) return key; } return v; }
  function tf(key) { var s = t(key); for (var i=1; i<arguments.length; i++) s = s.replace('{'+(i-1)+'}', String(arguments[i])); return s; }

  function applyLang() {
    var d = LANG_DATA[lang];
    if (!d) return;
    document.querySelector('.lang-calc').textContent = '📈 ' + d.calc;
    document.querySelector('.lang-subtitle').textContent = d.subtitle;
    document.querySelector('.lang-footer').textContent = d.footer;
    if (chartInstance) run();
  }

  function toggleLang() {
    var langs = ['cn','de','en'];
    var idx = langs.indexOf(lang);
    lang = langs[(idx + 1) % 3];
    localStorage.setItem('immo-lang', lang);
    applyLang();
  }

  // ============================
  // Share — Generate PNG Image
  // ============================
  function buildShareCard() {
    var inp = getInputs();
    var result = calculate(inp);
    var data = result.data;
    var last = data[data.length - 1];
    var pl = t('param_labels') || {};
    var dk = LANG_DATA[lang] || {};

    document.getElementById('shareDate').textContent = new Date().toLocaleString(lang==='cn'?'zh-CN':lang==='de'?'de-DE':'en-US');

    var shareIn = document.getElementById('shareInputs');
    var rows = [];
    var keys = ['purchasePrice','appreciationRate','monthlyRent','rentIncrease','grunderwerbsteuer','notar','makler','downPayment','interestRate','tilgung','hausgeld','grundsteuer','insurance','maintenanceRate','taxRate','afaRate','buildingRatio','holdingPeriod'];
    var pctKeys = ['appreciationRate','rentIncrease','grunderwerbsteuer','notar','makler','interestRate','tilgung','maintenanceRate','taxRate','afaRate','buildingRatio'];
    for (var i=0; i<keys.length; i++) {
      var k = keys[i];
      var v = inp[k];
      if (pctKeys.indexOf(k)>=0) v = (v*100).toFixed(k==='interestRate'||k==='makler'?2:1)+'%';
      else if (['purchasePrice','monthlyRent','downPayment','hausgeld','grundsteuer','insurance'].indexOf(k)>=0) v = fmtEur(v);
      else if (k==='holdingPeriod') v = String(Math.round(v));
      rows.push('<div style="display:flex;justify-content:space-between;padding:0.25rem 0;border-bottom:1px solid #334155;"><span>'+(pl[k]||k)+'</span><span style="font-weight:600;">'+v+'</span></div>');
    }
    shareIn.innerHTML = rows.join('');

    var resBox = document.getElementById('shareResults');
    var profit = last.netWorth - data[0].netWorth;
    resBox.innerHTML = ''
      + '<div style="background:#334155;border-radius:6px;padding:0.6rem;text-align:center;"><div style="font-size:0.7rem;color:#94a3b8;">'+(dk.kpi_inv||'Investment')+'</div><div style="font-size:1.1rem;font-weight:700;color:#f1f5f9;">'+fmtEur(result.totalAcqCost)+'</div></div>'
      + '<div style="background:#334155;border-radius:6px;padding:0.6rem;text-align:center;"><div style="font-size:0.7rem;color:#94a3b8;">'+(dk.kpi_monthly||'Ann. Payment')+'</div><div style="font-size:1.1rem;font-weight:700;color:#f1f5f9;">'+fmtEur(result.monthlyPayment)+'/月</div></div>'
      + '<div style="background:#334155;border-radius:6px;padding:0.6rem;text-align:center;"><div style="font-size:0.7rem;color:#94a3b8;">'+(dk.kpi_roi||'ROI')+'</div><div style="font-size:1.1rem;font-weight:700;color:#22c55e;">'+fmtPercent(0)+'</div></div>'
      + '<div style="background:#334155;border-radius:6px;padding:0.6rem;text-align:center;"><div style="font-size:0.7rem;color:#94a3b8;">'+(dk.kpi_be||'B/E')+'</div><div style="font-size:1.1rem;font-weight:700;color:#f1f5f9;">'+tf('be_reached',findBreakEvenYear(data)||'')+'</div></div>'
      + '<div style="background:#334155;border-radius:6px;padding:0.6rem;text-align:center;"><div style="font-size:0.7rem;color:#94a3b8;">'+(dk.kpi_finalEq||'Equity')+'</div><div style="font-size:1.1rem;font-weight:700;color:#3b82f6;">'+fmtEur(last.equity)+'</div></div>'
      + '<div style="background:#334155;border-radius:6px;padding:0.6rem;text-align:center;"><div style="font-size:0.7rem;color:#94a3b8;">'+(dk.kpi_totalNw||'Net Worth')+'</div><div style="font-size:1.1rem;font-weight:700;color:'+(last.netWorth>=0?'#22c55e':'#ef4444')+';">'+fmtEur(last.netWorth)+'</div></div>';

    // Show card temporarily for capture
    var card = document.getElementById('shareCard');
    card.style.display = 'block';
    card.style.left = '';
    card.style.position = 'fixed';

    // Compute ROI again for card
    var tc = last.totalCapitalInjected;
    var sr = tc > 0 ? (profit / tc) * 100 : 0;
    var ar = 0;
    if (data.length-1 > 0 && tc > 0) { var f = 1 + sr/100; ar = f > 0 ? (Math.pow(f, 1/(data.length-1)) - 1) * 100 : 0; }
    // Update ROI cell
    var roiCells = card.querySelectorAll('#shareResults > div');
    if (roiCells.length >= 3) {
      var roiVal = roiCells[2].querySelector('div:last-child');
      if (roiVal) { roiVal.textContent = fmtPercent(ar); roiVal.style.color = ar >= 0 ? '#22c55e' : '#ef4444'; }
    }
    // Update B/E cell
    if (roiCells.length >= 4) {
      var beVal = roiCells[3].querySelector('div:last-child');
      if (beVal) beVal.textContent = tf('be_reached', findBreakEvenYear(data) || t('be_none'));
    }

    html2canvas(card, { backgroundColor:'#1e293b', scale:2, useCORS:true, logging:false }).then(function(canvas) {
      card.style.display = 'none';
      card.style.left = '-9999px';
      var link = document.createElement('a');
      link.download = 'ImmoCalculator_' + new Date().toISOString().slice(0,10) + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
})();
