/* ALL CONTENT LIVES HERE. Edit dates, venues, photos, and which environment layers each scene gets.
   Layer syntax: 'file | mobile | tablet | desktop' — keys: w l r t b (position) z rot o f(flip). 'x' hides. A tier inherits the previous one. */
const V='The Oasis Ranch, Dallas';
const EVENTS=[
{k:'pellikuthuru',t:'పెళ్లికూతురు',n:'Pellikuthuru',cls:'w-vindu',fc:'#4B5E3A',when:'2026-11-16T10:00:00-06:00',date:'16 November 2026',time:'Morning',venue:V,desc:'Family blessings and turmeric to begin the bride\'s wedding days.',
 side:'R',aw:'78vw',art:'haldi-art-1.webp',node:'kolam-lotus-node.webp',extras:[],hero:'haldi-art-1.webp'},
{k:'haldi',t:'పసుపు',n:'Haldi',cls:'w-pasupu',fc:'#C98A16',when:'2026-11-16T18:00:00-06:00',date:'16 November 2026',time:'Evening',venue:V,desc:'Turmeric, flowers and laughter to bless the bride and groom.',
 side:'L',aw:'92vw',art:'haldi-art.webp',node:'kolam-lotus-node.webp',extras:[],hero:'haldi-art.webp'},
{k:'sangeeth',t:'సంగీత్',n:'Sangeeth',cls:'w-eng',fc:'#B45A3C',when:'2026-11-17T18:00:00-06:00',date:'17 November 2026',time:'6:00 PM',venue:V,desc:'An evening of music, dance and joy with family and friends.',
 side:'R',aw:'96vw',art:'engagement-art.webp',node:'kolam-lotus-node.webp',extras:[],hero:'engagement-art.webp'},
{k:'pelli',t:'పెళ్లి',n:'The Pelli',cls:'w-pelli',fc:'#6A1E2B',sevenBefore:1,when:'2026-11-18T18:01:00-06:00',date:'18 November 2026',time:'6:01 PM',venue:V,desc:'Seven steps, one promise. Join us beneath the mandapam.',
 side:'L',aw:'112vw',art:'jeelakarra-bellam-art.webp',node:'sacred-knot.webp',hero:'jeelakarra-bellam-art.webp',
 extras:['wedding-celestial-header.webp|w:40vw;r:4vw;t:-16vw;z:1|w:26vw;t:-10vw|w:min(18vw,320px);r:6vw;t:-1vw;z:1']}
];

/* Environment per world: one idea each, and only where it frames the subject */
const WORLD_ENV={
 sangeeth:['temple-parrot.webp|w:26vw;r:6vw;b:2vw;z:7|w:16vw;b:5vw|w:min(10vw,190px);r:6vw;b:8vh;z:7'],
 // After (shifted to the right):
 haldi: ['banana-leaves-corner.webp|w:52vw;r:-20vw;l:auto;t:36vw;z:1;rot:-6deg|w:30vw;r:-6vw;l:auto;t:20vw|w:min(12vw,220px);r:-1vw;l:auto;b:-2vw;z:1'],
 pelli:[],
//  vindu:['banana-leaves-corner.webp|x|x|w:min(11vw,200px);l:-2vw;t:-2vw;z:1']
};

/* Scenes: one supporting element each */
const SCENES={
 couple:['lotus-cluster.webp|w:44vw;l:-16vw;b:-4vw;z:2|w:30vw;l:-8vw|w:min(16vw,300px);l:-2vw;b:-4vw;z:2'],
//  reveal:['hanging-diya.webp|w:24vw;r:9vw;t:-3vw;z:6|w:15vw;r:14vw|w:min(9vw,160px);r:23vw;t:-2vw;z:6'],
 moments:['banana-leaves-corner.webp|w:46vw;r:-22vw;t:4vw;z:1;o:.8|w:26vw;r:-8vw|w:min(15vw,270px);r:-3vw;t:-3vw;z:1;o:.8'],
 blessings:['lotus-1.webp|w:36vw;r:-6vw;b:-6vw;z:1|w:30vw;l:-2vw;r:auto;b:-4vw|w:min(24vw,420px);l:6vw;b:-4vw;z:1'],
 rsvp:['hanging-diya.webp|w:26vw;r:8vw;t:-3vw;z:6|w:16vw;r:12vw|w:min(14vw,240px);r:16vw;t:-2vw;z:6'],
 close:[]
};

/* Memory wall. m = mobile [left, top, width, rotation, z] in vw; d = tablet/desktop. Photos may bleed off screen.
   Replace src with real photographs (e.g. 'photos/01.jpg'); illustrations stand in for now. */
const PHOTOS=[
{src:'couple.webp',cap:'Harika & Prem',pos:'50% 30%',m:[-6,0,66,-3,2],d:[3,4,30,-4,2]},
{src:'engagement-art.webp',cap:'Sangeeth',pos:'50% 40%',m:[44,34,62,4,3],d:[26,26,24,5,3]},
{src:'haldi-art-1.webp',cap:'Pellikuthuru',pos:'50% 25%',m:[-10,78,58,-5,2],d:[47,2,26,3,2]},
{src:'jeelakarra-bellam-art.webp',cap:'Pelli',pos:'50% 50%',m:[30,104,74,3,4],d:[66,22,38,-4,4]},
// {src:'vindu-bhojanam-art.webp',cap:'Vindu Bhojanam',pos:'50% 20%',m:[-4,148,52,-6,3],d:[-3,36,24,-6,3]},
{src:'haldi-art.webp',cap:'Haldi',pos:'50% 40%',m:[40,168,56,5,2],d:[44,36,28,5,2]}];
