import React,{useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

const tg=window.Telegram?.WebApp;
tg?.ready(); tg?.expand();

const seed=[
 {id:1,name:'Зарплата',cat:'Доход',amount:350000,income:true,date:'Сегодня'},
 {id:2,name:'Кафе',cat:'Еда',amount:2500,income:false,date:'Сегодня'},
 {id:3,name:'Такси',cat:'Транспорт',amount:1800,income:false,date:'Сегодня'},
 {id:4,name:'Магазин',cat:'Покупки',amount:17000,income:false,date:'Сегодня'}
];
const money=n=>Math.round(n).toLocaleString('ru-RU')+' ₸';
const cats=['Еда','Транспорт','Покупки','Развлечения','Счета','Здоровье','Другое'];
function parseText(s){
 const m=s.replace(/\s/g,'').match(/([0-9]+(?:[.,][0-9]+)?)/);
 if(!m)return null;
 const amount=Number(m[1].replace(',','.'));
 const low=s.toLowerCase();
 const income=/зарплат|получил|получила|доход|поступил|заработал/.test(low);
 let cat='Другое';
 if(/такси|автобус|метро|бензин|дорог/.test(low))cat='Транспорт';
 else if(/еда|кафе|ресторан|продукт|обед|ужин/.test(low))cat='Еда';
 else if(/магазин|покупк|одежд|техника/.test(low))cat='Покупки';
 else if(/кино|игр|бар|концерт/.test(low))cat='Развлечения';
 return {amount,name:income?'Доход':s.trim().slice(0,28),cat,income};
}
function App(){
 const[items,setItems]=useState(()=>JSON.parse(localStorage.getItem('muvso_items')||'null')||seed);
 const[tab,setTab]=useState('home');
 const[show,setShow]=useState(false);
 const[quick,setQuick]=useState('');
 const[name,setName]=useState('');
 const[amount,setAmount]=useState('');
 const[income,setIncome]=useState(false);
 const[goal,setGoal]=useState(()=>JSON.parse(localStorage.getItem('muvso_goal')||'null')||{name:'Новая цель',target:500000,saved:0});
 const balance=items.reduce((a,x)=>a+(x.income?x.amount:-x.amount),0);
 const earned=items.filter(x=>x.income).reduce((a,x)=>a+x.amount,0);
 const spent=items.filter(x=>!x.income).reduce((a,x)=>a+x.amount,0);
 const budget=30000,left=Math.max(0,budget-spent),pct=Math.min(100,Math.round(spent/budget*100));
 const save=(next)=>{setItems(next);localStorage.setItem('muvso_items',JSON.stringify(next));};
 const add=(data)=>{if(!data?.amount||data.amount<=0)return;const next=[{id:Date.now(),...data,date:'Сегодня'},...items];save(next);setQuick('');setName('');setAmount('');setShow(false);};
 const submit=()=>add({name:name|| (income?'Доход':'Расход'),amount:Number(amount),cat:income?'Доход':'Другое',income});
 const quickAdd=()=>{const p=parseText(quick);if(p)add(p);};
 const stats=useMemo(()=>cats.map(c=>({c,v:items.filter(x=>!x.income&&x.cat===c).reduce((a,x)=>a+x.amount,0)})).filter(x=>x.v),[items]);
 const title=tab==='home'?'Обзор':tab==='stats'?'Аналитика':tab==='history'?'История операций':tab==='goals'?'Финансовые цели':'Профиль';
 return <div className="app">
  <header><div><small>MUVSO · ТВОИ ДЕНЬГИ ПОД КОНТРОЛЕМ</small><h1>{title}</h1></div><div className="avatar">M</div></header>
  {tab==='home'&&<main>
   <section className="hero balance-hero">
    <div className="balance-top"><span className="balance-label">ОБЩИЙ БАЛАНС</span><span className="balance-chip">↗ Финансы</span></div>
    <div className="balance-value">{money(balance)}</div>
    <div className="balance-caption">Текущий остаток</div>
    <div className="balance-bottom"><div><span className="balance-dot"></span><span>Доступно по бюджету</span></div><b>{money(left)}</b></div>
    <div className="balance-progress"><span style={{width:pct+'%'}}></span></div>
    <div className="balance-foot"><span>Потрачено {money(spent)}</span><span>Лимит {money(budget)}</span></div>
    <div className="balance-glow"></div>
   </section>
   <section className="grid money-grid">
    <div className="money-tile income-tile"><div className="tile-icon">↙</div><small>ДОХОДЫ</small><b>{money(earned)}</b><span>↑ Поступления</span></div>
    <div className="money-tile expense-tile"><div className="tile-icon">↗</div><small>РАСХОДЫ</small><b>{money(spent)}</b><span>↓ Потрачено</span></div>
   </section>
   <div className="home-section-title"><div><small>БЫСТРОЕ ДЕЙСТВИЕ</small><h2>Записать операцию</h2></div></div>
   <section className="actions home-actions"><button onClick={()=>{setIncome(false);setShow(true)}}><span>−</span> Добавить расход</button><button onClick={()=>{setIncome(true);setShow(true)}}><span>＋</span> Добавить доход</button></section>
   <section className="quick"><input value={quick} onChange={e=>setQuick(e.target.value)} onKeyDown={e=>e.key==='Enter'&&quickAdd()} placeholder="Например: потратил 4000 на такси"/><button onClick={quickAdd}>→</button></section>
   <div className="head"><span>ПОСЛЕДНИЕ ОПЕРАЦИИ</span><button onClick={()=>setTab('history')}>Все →</button></div>
   <section className="list">{items.slice(0,5).map(x=><Tx key={x.id} x={x}/>)}</section>
   <div className="budget-note"><div className="budget-note-icon">✦</div><div><b>{pct>=100?'Бюджет на сегодня исчерпан':'Держи расходы под контролем'}</b><small>{pct>=100?'Остановись и пересмотри план расходов.':'Осталось '+money(left)+' из дневного лимита.'}</small></div></div>
  </main>}
  {tab==='stats'&&<main><section className="card"><small>РАСХОДЫ ПО КАТЕГОРИЯМ</small><h2>{money(spent)}</h2><div className="bars">{stats.map(s=><div className="bar" key={s.c}><span style={{height:Math.max(8,Math.round(s.v/Math.max(spent,1)*150))+'px'}}></span><small>{s.c}</small><b>{money(s.v)}</b></div>)}</div></section></main>}
  {tab==='history'&&<main><section className="list">{items.map(x=><Tx key={x.id} x={x}/>)}</section></main>}
  {tab==='goals'&&<main><section className="card"><small>ТВОЯ ЦЕЛЬ</small><h2>{goal.name}</h2><div className="goal"><span style={{width:Math.min(100,goal.saved/goal.target*100)+'%'}}></span></div><p>{money(goal.saved)} из {money(goal.target)}</p><button className="primary" onClick={()=>{const v=prompt('Сколько добавить?', '10000');if(v&&Number(v)>0){const g={...goal,saved:goal.saved+Number(v)};setGoal(g);localStorage.setItem('muvso_goal',JSON.stringify(g));}}}>＋ Пополнить цель</button></section></main>}
  {tab==='profile'&&<main><section className="card profile"><div className="bigavatar">M</div><h2>MUVSO</h2><p>Твой личный финансовый помощник.</p><small>Данные хранятся локально в этом браузере.</small></section></main>}
  {show&&<div className="back" onClick={e=>e.target===e.currentTarget&&setShow(false)}><div className="modal"><div className="mh"><h2>{income?'Добавить доход':'Добавить расход'}</h2><button onClick={()=>setShow(false)}>×</button></div><input placeholder="Название операции" value={name} onChange={e=>setName(e.target.value)}/><input inputMode="decimal" placeholder="Сумма в ₸" value={amount} onChange={e=>setAmount(e.target.value)}/><button className="primary" onClick={submit}>Сохранить операцию</button></div></div>}
  <nav>{[['home','⌂','Главная'],['stats','◷','Аналитика'],['history','☷','История'],['goals','◎','Цели'],['profile','◉','Профиль']].map(([k,i,l])=><button key={k} className={tab===k?'sel':''} onClick={()=>setTab(k)}><span>{i}</span><small>{l}</small></button>)}</nav>
 </div>
}
function Tx({x}){return <div className="tx"><i className={x.income?'tx-income':'tx-expense'}>{x.income?'↙':'↗'}</i><div><b>{x.name}</b><small>{x.cat} · {x.date}</small></div><strong className={x.income?'in':''}>{x.income?'+':'−'}{money(x.amount)}</strong></div>}
createRoot(document.getElementById('root')).render(<App/>);