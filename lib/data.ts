export type Team = 'A'|'B'|'user';
export interface Agent {id:string;name:string;role:string;team:Team;}
export const agents:Agent[]=[
{id:'a1',name:'Dr. Kavya Sharma',role:'Cognitive scientist',team:'A'},
{id:'a2',name:'Neha Joshi',role:'Tech journalist',team:'A'},
{id:'a3',name:'Dr. Priya Rao',role:'AI researcher',team:'A'},
{id:'a4',name:'Vikram Singh',role:'Systems engineer',team:'A'},
{id:'a5',name:'Maya Patel',role:'Technology optimist',team:'A'},
{id:'b1',name:'Rajan Mehta',role:'AI safety analyst',team:'B'},
{id:'b2',name:'Arjun Das',role:'Philosopher',team:'B'},
{id:'b3',name:'Dr. Leela Sen',role:'Academic',team:'B'},
{id:'b4',name:'Kabir Shah',role:'Policy researcher',team:'B'},
{id:'b5',name:'Zoya Ali',role:'Engineer',team:'B'}];
export interface Statement {id:string;agentId:string;round:number;parentId?:string;type:'NEW ANGLE'|'COUNTER'|'REINFORCE'|'WILDCARD'|'YOU';text:string;confidence:number;cite?:{title:string;url:string};}
export const script:Statement[]=[
{id:'s1',agentId:'a1',round:1,type:'NEW ANGLE',text:'Ask what AGI means and the goalposts move every year. A system that writes working code, passes medical exams and explains physics to a ten-year-old is not narrow anymore. At some point the line moved, not the thing.',confidence:78},
{id:'s2',agentId:'b1',round:1,parentId:'s1',type:'COUNTER',text:'Kavya, passing exams is a memory test with extra steps. On puzzles a model has never seen, like ARC-AGI, the same systems stumble on tasks a child solves in seconds. That gap is the whole argument.',confidence:84},
{id:'s3',agentId:'a2',round:1,type:'NEW ANGLE',text:'Rajan, that benchmark is one test, and it is already falling. Every few months a wall gets declared and then climbed. Meanwhile a nurse, a coder and a teacher use the same system today. Breadth in daily use counts.',confidence:73},
{id:'s4',agentId:'b2',round:2,parentId:'s3',type:'COUNTER',text:'Breadth is not generality, Neha. A library serves every profession and nobody calls it intelligent. Show me a system that learns a brand new rule from three examples and keeps it, then we can talk about achieved.',confidence:86},
{id:'s5',agentId:'a3',round:2,parentId:'s2',type:'REINFORCE',text:'Arjun, learning from a handful of examples is what in-context learning does, imperfectly. I agree the standard is new rules under new conditions. Let us score that openly instead of arguing about the word.',confidence:81},
{id:'s6',agentId:'b3',round:2,parentId:'s5',type:'COUNTER',text:'Priya, imperfect is the problem. Models trained on most of the internet may have seen the test already, so a high score can mean memorised, not understood. Until evaluations are clean, \'achieved\' is a marketing word.',confidence:89},
{id:'s7',agentId:'a4',round:3,type:'NEW ANGLE',text:'Fair, Leela. Here is the narrow claim I will defend: today\'s systems show real general-purpose pieces of intelligence, and open evaluations should track the rest. Calling that nothing is as wrong as calling it done.',confidence:80},
{id:'s8',agentId:'b4',round:3,parentId:'s7',type:'COUNTER',text:'I can sign that, Vikram. Progress is real. But \'achieved AGI\' needs steady performance in unfamiliar situations, and the evidence is not there yet. Unproven is the honest verdict today.',confidence:92}
];
export const suggestions=['Should cities ban cars downtown?','Is remote work dying?','Should social media have a minimum age of 16?','Is nuclear power essential for fighting climate change?','Should college be free for everyone?','Are electric cars really greener?'];
export const topics=['Has AI achieved AGI?','Should AI be open source?','Is remote work dying?'];
export const rooms=[{id:'arena',number:'01',name:'The Arena',label:'10 minds · 2 sides',color:'#4FC3F7'},{id:'thinkalong',number:'02',name:'Think-Along',label:'Your seat at the table',color:'#69F0AE'},{id:'live',number:'03',name:'Live Now',label:'3 debates on air',color:'#FF7043'},{id:'trophy',number:'04',name:'Trophy Room',label:'Arguments worth keeping',color:'#FFD54F'},{id:'community',number:'05',name:'Community',label:'Big questions start here',color:'#80CBC4'}] as const;
export const archives=[{topic:'Should AI be open source?',category:'Technology',votes:142,winner:'A',summary:'Open research meets responsible release. A debate about who gets to shape the next generation of AI.'},{topic:'Is remote work dying?',category:'Business',votes:86,winner:'B',summary:'Flexibility, collaboration, and what a workplace actually needs to work.'},{topic:'Can science explain consciousness?',category:'Philosophy',votes:104,winner:'B',summary:'From neurons to subjective experience: where measurement ends and the hard problem begins.'},{topic:'Should cities be car-free?',category:'Society',votes:48,winner:'A',summary:'A clash over public space, accessibility, and the shape of our everyday lives.'}];
export function seed(name:string){let n=0;for(const c of name)n=(n*31+c.charCodeAt(0))>>>0;return n;}
export function avatarSVG(name:string,team:Team='A'){const h=seed(name), skin=['#F5C9A4','#DCA078','#BA7956','#8D563C','#E7B991','#704734'][h%6],hair=['#302127','#563628','#B9854D','#191C29','#9094A5','#D9BE77'][(h>>>3)%6],shirt=team==='A'?'#4FC3F7':team==='B'?'#FF7043':'#CE93D8';return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 16 24" shape-rendering="crispEdges"><path fill="#141420" d="M4 21h3v3H3v-2h1m5-1h3v3H9"/><path fill="${shirt}" d="M4 12h8v9H4zM2 13h2v6H2m10-6h2v6h-2"/><path fill="${skin}" d="M5 4h6v7H5zM4 5h8v5H4zM7 11h2v2H7zM2 19h2v2H2m10-2h2v2h-2"/><path fill="${hair}" d="M4 3h8v3H4zM3 4h2v5H3zM11 4h2v4h-2"/><path fill="#211E2C" d="M5 7h2v1H5m4-1h2v1H9"/><path fill="#AD6255" d="M7 9h2v1H7"/>${h%3===0?'<path fill="#434153" d="M4 6h4v3H4zm4 0h4v3H8"/><path fill="#DBE8F1" d="M5 7h2v1H5m4-1h2v1H9"/>':''}<path fill="#FFFFFF" opacity=".35" d="M5 13h1v6H5"/></svg>`}
