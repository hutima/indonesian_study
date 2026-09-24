// Original practice informed by the grammar progression of textbook Topic 1.
export const unit04 = {
  id: 'id-stage2-unit04', title: 'Kesehatan dan saran', level: 4,
  description: 'Baca pesan keluarga tentang kesehatan, kenali kata kerja meN-, lalu pahami saran dan perintah.',
  guide: {
    vocabulary: 'Recognize useful health words and distinguish roots from the verbs you actually see in writing.',
    morphology: 'meN- often forms an active verb with an object; its surface shape changes with the root. In a direct instruction, the prefix can disappear.',
    reading: 'Follow a short family message first; look for advice, cause, and the person doing each action.'
  },
  vocabulary: [
    { id:'id-u04-voc-sehat',unitId:'id-stage2-unit04',form:'sehat',meaning:'healthy',pos:'adjective',register:'neutral',kind:'root',example:'Ayah sudah sehat kembali.' },
    { id:'id-u04-voc-sakit',unitId:'id-stage2-unit04',form:'sakit',meaning:'sick; painful',pos:'adjective',register:'neutral',kind:'root',example:'Perutnya sakit sejak pagi.' },
    { id:'id-u04-voc-perut',unitId:'id-stage2-unit04',form:'perut',meaning:'stomach; belly',pos:'noun',register:'neutral',kind:'root',example:'Perut Rani terasa tidak nyaman.' },
    { id:'id-u04-voc-makanan',unitId:'id-stage2-unit04',form:'makanan',meaning:'food',pos:'noun',register:'neutral',kind:'derived',root:'makan',example:'Makanan itu terlalu pedas.' },
    { id:'id-u04-voc-minum',unitId:'id-stage2-unit04',form:'minum',meaning:'drink (verb)',pos:'verb',register:'neutral',kind:'root',example:'Rani minum air putih.' },
    { id:'id-u04-voc-air-putih',unitId:'id-stage2-unit04',form:'air putih',meaning:'plain drinking water',pos:'noun',register:'neutral',kind:'root',example:'Ibu menyuruh Rani minum air putih.' },
    { id:'id-u04-voc-jaga',unitId:'id-stage2-unit04',form:'jaga',meaning:'watch over; guard (root)',pos:'verb',register:'neutral',kind:'root',example:'Jaga kesehatanmu saat bepergian.' },
    { id:'id-u04-voc-menjaga',unitId:'id-stage2-unit04',form:'menjaga',meaning:'look after; maintain',pos:'verb',register:'neutral',kind:'derived',root:'jaga',example:'Ibu menjaga kesehatannya dengan berjalan kaki.' },
    { id:'id-u04-voc-kurang',unitId:'id-stage2-unit04',form:'kurang',meaning:'less; lacking',pos:'adjective',register:'neutral',kind:'root',example:'Tidurnya kurang semalam.' },
    { id:'id-u04-voc-mengurangi',unitId:'id-stage2-unit04',form:'mengurangi',meaning:'reduce something',pos:'verb',register:'formal',kind:'derived',root:'kurang',example:'Dokter menyarankan Rani mengurangi makanan pedas.' },
    { id:'id-u04-voc-hindar',unitId:'id-stage2-unit04',form:'hindar',meaning:'avoid (root)',pos:'verb',register:'neutral',kind:'root',example:'Ia berusaha menghindari makanan pedas.' },
    { id:'id-u04-voc-menghindari',unitId:'id-stage2-unit04',form:'menghindari',meaning:'avoid something',pos:'verb',register:'formal',kind:'derived',root:'hindar',example:'Rani menghindari makanan yang terlalu pedas.' },
    { id:'id-u04-voc-hindari',unitId:'id-stage2-unit04',form:'hindari',meaning:'avoid it! (instruction)',pos:'verb',register:'formal',kind:'derived',root:'hindar',example:'Hindari makanan pedas untuk sementara.',note:'Imperative form without meN-; -i remains attached.' },
    { id:'id-u04-voc-saran',unitId:'id-stage2-unit04',form:'saran',meaning:'advice; suggestion',pos:'noun',register:'neutral',kind:'root',example:'Ibu memberi Rani saran sederhana.' },
    { id:'id-u04-voc-menyarankan',unitId:'id-stage2-unit04',form:'menyarankan',meaning:'recommend; suggest something',pos:'verb',register:'formal',kind:'derived',root:'saran',example:'Dokter menyarankan istirahat sehari.' },
    { id:'id-u04-voc-istirahat',unitId:'id-stage2-unit04',form:'istirahat',meaning:'rest; take a break',pos:'verb',register:'neutral',kind:'root',example:'Rani istirahat di rumah hari ini.' },
    { id:'id-u04-voc-pedas',unitId:'id-stage2-unit04',form:'pedas',meaning:'spicy',pos:'adjective',register:'neutral',kind:'root',example:'Sambal ini sangat pedas.' }
  ],
  morphology: [
    {id:'id-u04-morph-menjaga',unitId:'id-stage2-unit04',form:'menjaga',context:'Ibu menjaga kesehatan keluarganya.',root:'jaga',affixes:['meN-'],process:'meN- forms an active verb; the subject Ibu looks after the object kesehatan keluarganya.',meaning:'Ibu looks after the family’s health.',steps:[
      {prompt:'Apa yang dilakukan Ibu dalam kalimat ini?',choices:['She looks after her family’s health.','Her family’s health looks after her.','She becomes healthy accidentally.'],answer:'She looks after her family’s health.',focus:'semantic',explanation:'menjaga describes Ibu doing the action to kesehatan keluarganya.'},
      {prompt:'Apa fungsi awalan meN- di sini?',choices:['Forms an active verb with Ibu as the doer.','Forms a noun for a health problem.','Makes keluarganya the doer.'],answer:'Forms an active verb with Ibu as the doer.',focus:'semantic',explanation:'The root jaga becomes the active verb menjaga. The root’s j is retained.'}
    ]},
    {id:'id-u04-morph-mengurangi',unitId:'id-stage2-unit04',form:'mengurangi',context:'Rani mengurangi makanan pedas.',root:'kurang',affixes:['meN-','-i'],process:'The derived verb means actively make something less; the initial k of kurang disappears after meng-.',meaning:'Rani cuts back on spicy food.',steps:[
      {prompt:'Apa perubahan makna dari kurang ke mengurangi?',choices:['From “less/lacking” to “reduce something.”','From “less” to “be reduced by someone.”','From “less” to “a reduction” (noun).'],answer:'From “less/lacking” to “reduce something.”',focus:'semantic',explanation:'Rani actively reduces the amount of spicy food; makanan pedas is what she reduces.'},
      {prompt:'Apa yang terjadi pada bunyi awal k dalam kurang?',choices:['It disappears in mengurangi.','It stays unchanged.','It becomes p.'],answer:'It disappears in mengurangi.',explanation:'With this root, meN- surfaces as meng- and the initial k drops.'}
    ]},
    {id:'id-u04-morph-menghindari',unitId:'id-stage2-unit04',form:'menghindari',context:'Rani menghindari sambal untuk sementara.',root:'hindar',affixes:['meN-','-i'],process:'meN-...-i forms an active verb taking an object: Rani avoids sambal.',meaning:'Rani avoids sambal for now.',steps:[
      {prompt:'Apa hubungan Rani dengan sambal di sini?',choices:['Rani deliberately avoids it.','Rani serves it to someone.','Rani is avoided by it.'],answer:'Rani deliberately avoids it.',focus:'semantic',explanation:'The active verb menghindari acts on sambal as its object.'},
      {prompt:'Dalam saran langsung “Hindari sambal!”, apa yang berubah?',choices:['meN- disappears, but -i remains.','di- replaces meN-.','The word turns into a noun.'],answer:'meN- disappears, but -i remains.',focus:'semantic',explanation:'Direct imperatives can drop the active meN- prefix: menghindari → hindari.'}
    ]},
    {id:'id-u04-morph-menyarankan',unitId:'id-stage2-unit04',form:'menyarankan',context:'Dokter menyarankan istirahat.',root:'saran',affixes:['meN-','-kan'],process:'meN-...-kan forms a verb meaning give or recommend a suggestion; the initial s of saran drops after meny-.',meaning:'The doctor recommends rest.',steps:[
      {prompt:'Apa peran dokter pada “menyarankan istirahat”?',choices:['The doctor recommends rest.','The doctor receives advice from rest.','The doctor is the advice itself.'],answer:'The doctor recommends rest.',focus:'semantic',explanation:'menyarankan means to recommend something; the doctor is the source of the recommendation.'}
    ]}
  ],
  readings:[{id:'id-u04-reading-pesan',unitId:'id-stage2-unit04',title:'Pesan Ibu untuk Rani',text:'Rani merasa sakit perut setelah makan siang. Ia memberi tahu ibunya lewat pesan. Ibu menyarankan Rani minum air putih dan istirahat. “Hindari makanan pedas dulu,” tulis Ibu. Rani mengikuti saran itu. Sore harinya, perutnya mulai terasa lebih baik.',translation:'Rani feels stomach pain after lunch. She tells her mother by message. Her mother recommends that Rani drink plain water and rest. “Avoid spicy food for now,” her mother writes. Rani follows the advice. By the afternoon, her stomach begins to feel better.',questions:[
    {id:'id-u04-readq-cause',unitId:'id-stage2-unit04',prompt:'Mengapa Rani mengirim pesan kepada ibunya?',choices:['Karena perutnya sakit.','Karena ia ingin membeli sambal.','Karena ibunya pergi ke sekolah.'],answer:'Karena perutnya sakit.',explanation:'The first two sentences say Rani has stomach pain and tells her mother.'},
    {id:'id-u04-readq-advice',unitId:'id-stage2-unit04',prompt:'Apa saran Ibu kepada Rani?',choices:['Minum air putih dan istirahat.','Makan lebih banyak sambal.','Pergi bekerja sore hari.'],answer:'Minum air putih dan istirahat.',explanation:'Ibu explicitly suggests water and rest; she also says to avoid spicy food.'}
  ]}]
};
