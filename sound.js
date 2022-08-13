export default async function sound({THREE,camera,gui}) {
    let spinSounds = [`spin0`, `spin1`, `spin2`, `spin3`, `spin4`]
    let audioLoader = new THREE.AudioLoader();
    let snds = {}
    let loadSound = async(name)=>{
        return new Promise((resolve,reject)=>{
            audioLoader.load(name, (audio)=>{
                resolve(audio);
            }
            )
        }
        )
    }
let audioReady=false

    
    // create an AudioListener and add it to the camera 
    const listener = new THREE.AudioListener(); 
    camera.add( listener ); // create a global audio source
   //const sound = new THREE.Audio( listener );
    // load a sound and set it as the Audio object's buffer const audioLoader = new THREE.AudioLoader(); audioLoader.load( 'sounds/ambient.ogg', function( buffer ) { sound.setBuffer( buffer ); sound.setLoop( true ); sound.setVolume( 0.5 ); sound.play(); });
    let soundChannels=[]
    for(let i=0;i<8;i++)soundChannels.push(new THREE.Audio( listener ));
    let chanTop=0;


    spinSounds.forEach(async name=>snds[name] = await loadSound('./assets/' + name + '.ogg'))
    snds['done'] = await loadSound('./assets/done.ogg');

    
    let firstInteraction = ()=>{
        document.removeEventListener('pointerdown',firstInteraction)
        audioReady = true;
        playSound({name:'done'})
    }
    document.addEventListener('pointerdown',firstInteraction)
    
let sndParams = {'🔊':true} 
gui.add(sndParams,'🔊')
    let playSound = ({name='done',detune=0})=>{
        if(!sndParams['🔊'])return;
        let snd = snds[name];
        let sound = soundChannels[(chanTop++)%soundChannels.length];
        if(sound.isPlaying)sound.stop()
        sound.setBuffer( snd ); 
        sound.setLoop( false ); 
        sound.setVolume( 0.5 ); 
        sound.play()
        sound.setDetune(detune);
    }
    document.addEventListener('sound', (e)=>playSound(e.detail))
}
