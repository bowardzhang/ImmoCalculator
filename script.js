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

  // ===== Legend Hover Tooltip =====
  var legendDescriptions = {
    'cumulativeCashflow': '<b>累计净现金流</b><br>每年所有现金流入减去流出的累计值。<br>起始为负（首付支出），之后每年叠加：租金收入 − 贷款本息 − 维修 − Hausgeld − Grundsteuer − 保险 − 税费。<br>转正意味着累计现金回流已覆盖初始投入。',
    'equity': '<b>房屋净值 (Eigenkapital)</b><br>当前房价 − 剩余贷款。<br>反映如果此时卖掉房产并还清贷款后能拿到的钱。<br>随房价增值和贷款还本逐年增加。',
    'remainingLoan': '<b>剩余贷款 (Restschuld)</b><br>尚未还清的银行贷款余额。<br>每年递减 = 上年余额 − 当年本金偿还 (Tilgung)。<br>贷款还清后归零，此时月供停止。',
    'netWorth': '<b>总净资产 (Gesamtvermögen)</b><br>房屋净值 + 累计净现金流。<br>= 房价 − 剩余贷款 + (首付支出 + 历年净现金流)。<br>这是衡量投资总回报的核心指标：你的全部财富（房产权益 + 现金）。'
  };
  var legendTooltipEl = null;
  function getLegendTooltipEl() {
    if (!legendTooltipEl) {
      legendTooltipEl = document.createElement('div');
      legendTooltipEl.className = 'legend-tooltip';
      legendTooltipEl.style.display = 'none';
      document.body.appendChild(legendTooltipEl);
    }
    return legendTooltipEl;
  }
  function bindLegendHover() {
    var tip = getLegendTooltipEl();
    var canvas = chartCanvas;
    canvas.addEventListener('mousemove', function(e) {
      if (!chartInstance || !chartInstance.legend) return;
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var items = chartInstance.legend.legendItems;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item) continue;
        var ix = item.x, iy = item.y;
        var iw = item.width || 120, ih = item.height || 16;
        if (mx >= ix && mx <= ix + iw && my >= iy - 4 && my <= iy + ih + 4) {
          var text = item.text || '';
          var key = text.indexOf('Kum') >= 0 ? 'cumulativeCashflow'
            : text.indexOf('Eigen') >= 0 ? 'equity'
            : text.indexOf('Rest') >= 0 ? 'remainingLoan'
            : text.indexOf('Gesamt') >= 0 ? 'netWorth' : null;
          if (key && legendDescriptions[key]) {
            tip.innerHTML = legendDescriptions[key];
            tip.style.display = 'block';
            var canvasRect = canvas.getBoundingClientRect();
            var tipX = canvasRect.left + window.scrollX + ix;
            var tipY = canvasRect.top + window.scrollY - tip.offsetHeight - 6;
            if (tipY < window.scrollY + 4) tipY = canvasRect.bottom + window.scrollY + 6;
            tip.style.left = tipX + 'px';
            tip.style.top = tipY + 'px';
            return;
          }
        }
      }
      tip.style.display = 'none';
    });
    canvas.addEventListener('mouseleave', function() { tip.style.display = 'none'; });
  }

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
  document.addEventListener('DOMContentLoaded',function(){initTheme();initHeaderScroll();bindNumberFormatting();document.getElementById('themeToggle').addEventListener('click',toggleTheme);document.querySelectorAll('.btn-range').forEach(function(b){b.addEventListener('click',function(){openModal(b.dataset.param);});});document.getElementById('modalCloseBtn').addEventListener('click',closeModal);document.getElementById('rangeModal').addEventListener('click',function(e){if(e.target===this)closeModal();});document.getElementById('modalOptimizeBtn').addEventListener('click',function(){saveCurrentRanges();var md=document.getElementById('rangeModal'),pid=md.dataset.param,u=md.dataset.unit;var mn=parseFloat(document.getElementById('modalMin').value)||0;var mx=parseFloat(document.getElementById('modalMax').value)||100;if(mn>=mx){alert('最小值必须小于最大值');return;}var res=optimizeParam(pid,mn,mx);var me=paramMeta[pid];var dv=me.min>=1?Math.round(res.value):res.value.toFixed(me.step<0.1?2:1);document.getElementById('modalOptVal').textContent='最优值：'+dv+' '+u;document.getElementById('modalOptNote').textContent='对应总净资产：'+fmtEur(res.netWorth);document.getElementById('modalOptResult').style.display='block';});
document.getElementById('modalMin').addEventListener('input',saveCurrentRanges);
document.getElementById('modalMax').addEventListener('input',saveCurrentRanges);
document.getElementById('purchasePrice').addEventListener('input',function(){clampDownPayment();});
document.getElementById('downPayment').addEventListener('input',function(){clampDownPayment();});
run();bindLegendHover();});
})();
