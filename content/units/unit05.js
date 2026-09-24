// Original practice informed by textbook Topics 2–3 (family, register, passive).
export const unit05 = {
  id:'id-stage2-unit05',title:'Cerita keluarga dan bahasa resmi',level:5,
  description:'Bedakan bahasa keluarga dan bahasa resmi; baca frasa yang saya baca dan kata kerja pasif di-.',
  guide:{
    vocabulary:'Pair familiar ways of speaking with words common in formal writing: bilang/mengatakan, ngobrol/berbicara.',
    morphology:'A yang clause can describe a noun: pesan yang saya baca means the message that I read. With saya as the doer, the verb follows saya without meN-. Compare pesan itu dibaca Ibu.',
    reading:'Read the family conversation, then notice how the same event appears in a short formal notice.'
  },
  vocabulary:[
    {id:'id-u05-voc-bilang',unitId:'id-stage2-unit05',form:'bilang',meaning:'say; tell (conversational)',pos:'verb',register:'informal',kind:'root',example:'Ibu bilang acaranya mulai jam tujuh.'},
    {id:'id-u05-voc-kata',unitId:'id-stage2-unit05',form:'kata',meaning:'word; saying (root)',pos:'noun',register:'neutral',kind:'root',example:'Saya tidak tahu arti kata ini.'},
    {id:'id-u05-voc-mengatakan',unitId:'id-stage2-unit05',form:'mengatakan',meaning:'state; say (formal)',pos:'verb',register:'formal',kind:'derived',root:'kata',example:'Panitia mengatakan bahwa acara dimulai pukul tujuh.',note:'Common in formal reports; bilang is more conversational.'},
    {id:'id-u05-voc-ngobrol',unitId:'id-stage2-unit05',form:'ngobrol',meaning:'chat; have a conversation',pos:'verb',register:'informal',kind:'root',example:'Kami ngobrol setelah makan malam.'},
    {id:'id-u05-voc-bicara',unitId:'id-stage2-unit05',form:'bicara',meaning:'speak; talk',pos:'verb',register:'neutral',kind:'root',example:'Saya bicara dengan Tante Rina.'},
    {id:'id-u05-voc-berbicara',unitId:'id-stage2-unit05',form:'berbicara',meaning:'speak; converse (formal)',pos:'verb',register:'formal',kind:'derived',root:'bicara',example:'Ketua kelompok berbicara kepada para tamu.'},
    {id:'id-u05-voc-keluarga',unitId:'id-stage2-unit05',form:'keluarga',meaning:'family',pos:'noun',register:'neutral',kind:'root',example:'Keluarga kami berkumpul hari Minggu.'},
    {id:'id-u05-voc-kumpul',unitId:'id-stage2-unit05',form:'kumpul',meaning:'gather (root)',pos:'verb',register:'neutral',kind:'root',example:'Kami akan berkumpul di rumah Nenek.'},
    {id:'id-u05-voc-berkumpul',unitId:'id-stage2-unit05',form:'berkumpul',meaning:'gather together',pos:'verb',register:'neutral',kind:'derived',root:'kumpul',example:'Semua sepupu berkumpul di rumah Nenek.'},
    {id:'id-u05-voc-undang',unitId:'id-stage2-unit05',form:'undang',meaning:'invite (root)',pos:'verb',register:'neutral',kind:'root',example:'Ibu mengundang saudara-saudaranya.'},
    {id:'id-u05-voc-undangan',unitId:'id-stage2-unit05',form:'undangan',meaning:'invitation',pos:'noun',register:'neutral',kind:'derived',root:'undang',example:'Undangan itu dikirim kemarin.'},
    {id:'id-u05-voc-dikirim',unitId:'id-stage2-unit05',form:'dikirim',meaning:'is/was sent',pos:'verb',register:'neutral',kind:'derived',root:'kirim',example:'Pesan itu dikirim oleh Ibu.'},
    {id:'id-u05-voc-dibaca',unitId:'id-stage2-unit05',form:'dibaca',meaning:'is/was read',pos:'verb',register:'neutral',kind:'derived',root:'baca',example:'Pengumuman itu dibaca oleh para tamu.'},
    {id:'id-u05-voc-kan',unitId:'id-stage2-unit05',form:'kan',meaning:'right?; as you know (conversational particle)',pos:'particle',register:'informal',kind:'root',example:'Acara mulai jam tujuh, kan?',note:'This stand-alone particle differs from the attached verb suffix -kan.'},
    {id:'id-u05-voc-pengumuman',unitId:'id-stage2-unit05',form:'pengumuman',meaning:'announcement',pos:'noun',register:'formal',kind:'derived',root:'umum',example:'Pengumuman itu ditulis dalam bahasa resmi.'},
    {id:'id-u05-voc-hadir',unitId:'id-stage2-unit05',form:'hadir',meaning:'present; attend',pos:'verb',register:'formal',kind:'root',example:'Para tamu diminta hadir pukul tujuh.'}
  ],
  morphology:[
    {id:'id-u05-morph-mengatakan',unitId:'id-stage2-unit05',form:'mengatakan',context:'Ibu mengatakan bahwa acara dimulai pukul tujuh.',root:'kata',affixes:['meN-','-kan'],process:'The root kata (word/saying) becomes a formal transitive verb: state or say something. Its initial k drops after meng-.',meaning:'Ibu states that the event begins at seven.',steps:[
      {prompt:'Apa fungsi bentuk mengatakan di sini?',choices:['States the information in a formal register.','Names a single word.','Means the event has been announced by someone.'],answer:'States the information in a formal register.',focus:'semantic',explanation:'mengatakan is a formal verb for saying something; in family conversation bilang is often more natural.'},
      {prompt:'Bagaimana hubungan kata dan mengatakan?',choices:['The noun root becomes a verb meaning to say/state.','The root becomes a place.','The root becomes a passive verb with di-.'],answer:'The noun root becomes a verb meaning to say/state.',focus:'semantic',explanation:'meN-...-kan derives a verb from kata; the root’s k is omitted in meng- + kata + -kan.'}
    ]},
    {id:'id-u05-morph-dikirim',unitId:'id-stage2-unit05',form:'dikirim',context:'Undangan itu dikirim oleh Ibu.',root:'kirim',affixes:['di-'],process:'Attached di- forms a passive: the invitation is the thing sent; Ibu is named as the sender by oleh.',meaning:'The invitation was sent by Mother.',steps:[
      {prompt:'Apa yang berubah dari mengirim ke dikirim?',choices:['The invitation becomes the subject of a passive clause.','The invitation becomes the person sending.','The verb describes a location.'],answer:'The invitation becomes the subject of a passive clause.',focus:'semantic',explanation:'In the passive, undangan itu is what was sent; oleh Ibu names the agent.'}
    ]},
    {id:'id-u05-morph-baca',unitId:'id-stage2-unit05',form:'baca',context:'Pesan yang saya baca datang dari Nenek.',root:'baca',affixes:[],process:'After first-person agent saya in this yang clause, the verb appears without meN-. The phrase identifies the message I read.',meaning:'the message that I read',steps:[
      {prompt:'Dalam “pesan yang saya baca”, siapa yang membaca?',choices:['Saya.','Pesan.','Nenek.'],answer:'Saya.',focus:'semantic',explanation:'The first-person pronoun saya is the reader; yang saya baca describes pesan.'},
      {prompt:'Mengapa bentuknya “yang saya baca” di sini?',choices:['The message is described as what I read; saya comes before the bare verb.','It means the message read me.','The prefix di- marks a location.'],answer:'The message is described as what I read; saya comes before the bare verb.',focus:'semantic',explanation:'In this construction, the object pesan is brought forward and the first-person agent precedes the verb without meN-.'}
    ]},
    {id:'id-u05-morph-undangan',unitId:'id-stage2-unit05',form:'undangan',context:'Undangan dari Nenek sudah datang.',root:'undang',affixes:['-an'],process:'-an forms a noun for the result or object associated with inviting: an invitation.',meaning:'an invitation from Grandmother',steps:[
      {prompt:'Apa yang berubah ketika undang menjadi undangan?',choices:['The verb “invite” becomes the noun “invitation.”','It becomes “the person who invites.”','It becomes “was invited” (passive).'],answer:'The verb “invite” becomes the noun “invitation.”',focus:'semantic',explanation:'Undangan is the invitation itself, not a passive verb or the person who sends it.'}
    ]}
  ],
  readings:[{id:'id-u05-reading-keluarga',unitId:'id-stage2-unit05',title:'Pesan keluarga dan pengumuman',text:'Nenek mengirim pesan kepada keluarganya. “Minggu ini kita makan bersama di rumahku. Kalian bisa datang jam tujuh, kan?” Ibu membaca pesan itu dan bilang kepada Rani bahwa mereka akan datang. Sore harinya, Rani melihat pengumuman untuk semua tamu: “Pertemuan keluarga dimulai pukul tujuh. Para tamu diminta hadir tepat waktu.”',translation:'Grandmother sends a message to her family. “This Sunday we are eating together at my house. You can come at seven, right?” Mother reads the message and tells Rani that they will come. That afternoon, Rani sees an announcement for all the guests: “The family gathering begins at seven. Guests are requested to arrive on time.”',questions:[
    {id:'id-u05-readq-register',unitId:'id-stage2-unit05',prompt:'Bagian mana memakai bahasa lebih resmi?',choices:['Pengumuman untuk para tamu.','Pesan singkat Nenek.','Pertanyaan “kan?” dari Nenek.'],answer:'Pengumuman untuk para tamu.',explanation:'The announcement uses terms such as pertemuan, pukul, para tamu, and diminta hadir.'},
    {id:'id-u05-readq-event',unitId:'id-stage2-unit05',prompt:'Kapan keluarga diminta datang?',choices:['Pukul tujuh.','Pukul enam.','Besok pagi.'],answer:'Pukul tujuh.',explanation:'Both Nenek’s message and the formal announcement say the gathering starts at seven.'}
  ]}]
};
