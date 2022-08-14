export default function Qube({THREE, scene, loader,gui}) {
    let {Vector3, Object3D, InstancedMesh} = THREE;
    let {floor, min, max, PI} = Math;
    let km = `QWERTYASDFGHZXCVBN`.split("").map(e=>"Key" + e);
    let qube;
    let imesh;
    let blks = [];
    let history = []
    let ele = (type,x=0,y=0,text="QUBE!")=>{
        let status = document.createElement(type);
        status.innerText = text
        status.style = `color:blue;position:absolute;left:${x}px;top:${y}px;font-family:Arial;`
        document.body.appendChild(status)
        return status;
    }
let playSound=(prams={name:'done',volume:.5,loop:false})=>{
    document.dispatchEvent(new CustomEvent('sound',{detail:prams}))
}
    let status = ele('span', 120, 5);

    let shuffleButton = ele('button', 5, 5, "shuffle");
    shuffleButton.onclick = ()=>{
        (this.shuffle = !this.shuffle) && this.doShuffle()
        shuffleButton.style.color = this.shuffle ? 'red' : 'blue'

    }
    let solveButton = ele('button', 60, 5, "solve");
    solveButton.onclick = ()=>{
        (this.solving = !this.solving) && this.doSolve()
        solveButton.style.color = this.solving ? 'red' : 'blue'

    }
let cubeTemplates
    let cubeParams={
        style:0
    }
    let rbk = glb=>{
        let mats={}
        let matList=[]
        glb.scene.traverse(e=>{
            e.isMesh && (e.castShadow = e.receiveShadow = true);
            if (e.material) {
                mats[e.material.uuid]=e.material;
                e.material.metalness = .9;
                e.material.roughness = .1;
            }
        }
        );
        cubeTemplates=[glb.scene.children[2],glb.scene.children[3],glb.scene.children[4]]
        let m = cubeTemplates[cubeParams.style];
        let box = m;
        box.geometry.scale(.999,.999,.999)
        let spacing = 1.0;
        qube = this.root = new Object3D();
        let nr = 1;
        let nstep = 1;
        let originalPositions=[]
        for (let i = -nr, bx; i <= nr; i += nstep)
            for (let j = -nr; j <= nr; j += nstep)
                for (let k = -nr; k <= nr; k += nstep) {
                    qube.add((bx = box.clone()));
                    bx.userData.key = `${i},${j},${k}`;
                    
                    bx.position.set(i, j, k).multiplyScalar(spacing);
                    blks.push(bx);
                    bx.userData.startPosition = bx.position.clone();
                    bx.userData.startQuaternion = bx.quaternion.clone();
                }
        qube.scale.multiplyScalar(2);
let keys=Object.keys(mats)
        let mat=mats[keys[0]];
        let curMat;
		gui.add(mat,'envMapIntensity',0,10).onChange(v=>curMat&&(curMat.envMapIntensity=v))
		gui.add(mat,'metalness',0,1).onChange(v=>curMat&&(curMat.metalness=v))
        gui.add(mat,'roughness',0,1).onChange(v=>curMat&&(curMat.roughness=v))
        gui.add(cubeParams,'style',0,cubeTemplates.length).onChange(val=>{
            let ct=cubeTemplates[parseInt(val)%cubeTemplates.length];
            qube.children.forEach(e=>{
                e.geometry = ct.geometry;
                e.material = ct.material;
                curMat = e.material;
            })
        });
        
        
        gui.add(mat,'opacity',0,1).onChange(v=>{
            mat.opacity = v;
            mat.side=v==1?THREE.FrontSide:THREE.DoubleSide;
            mat.transparent = v==1?false:true;
            
        });
        
        
        qube.updateMatrix(true)
        scene.add(qube);
    }
    ;
    this.doSolve = ()=>{
        if (this.solving) {
            if(!rotating){
                if(history.length){
                    let code = history.pop();
                    if(code&1)code&=~1; else code|=1;
                    this.rotateSlab(code);
                    history.pop();
                }else{
                    this.solving = false;
                    solveButton.style.color = this.solving ? 'red' : 'blue'
                }
            }
            /*for (let i = 0; i < qube.children.length; i++) {
                let o = qube.children[i]
                o.quaternion.slerp(o.userData.startQuaternion, .1);
                o.position.lerp(o.userData.startPosition, .1);
            }*/
            
        }
    }
    new loader().load(`./assets/rbik1.glb`, rbk);
    let rot = new Vector3();
    let tv0 = new Vector3();

    let isSolved = ()=>{
        let dist = 0;
        tv0.copy(qube.children[0].rotation);
        qube.children.forEach(e=>tv1.copy(e.rotation) && (dist += tv0.distanceToSquared(tv1)))
        //console.log('-----', dist)
        return dist < .0002;
    }
    let sortSlabs = ()=>{
        qube.children.forEach(e=>{
            e.parent.worldToLocal(e.localToWorld(tv0.set(0, 0, 0)));
            (!e.userData.loc && (e.userData.loc = tv0.clone()))
            let loc = e.userData.loc;
            loc.copy(tv0);
            loc.x = floor(loc.x + 0.5);
            loc.y = floor(loc.y + 0.5);
            loc.z = floor(loc.z + 0.5);
            e.position.copy(loc);
            loc.add(tv0.set(1, 1, 1));
            (!e.userData.solvedLoc) && (e.userData.solvedLoc = loc.clone());
        }
        );
    }
    ;

    let getSlab = (axis,slab)=>{
        let c = qube.children;
        let cb = [];
        c.forEach(e=>{
            let loc = e.userData.loc;
            axis == 0 && loc.x == slab && cb.push(e);
            axis == 1 && loc.y == slab && cb.push(e);
            axis == 2 && loc.z == slab && cb.push(e);
        }
        );
        return cb;
    }
    ;
    let rotor = new Object3D();
    scene.add(rotor);
    let rotarget = tv0.clone();
    let rotating = false;
    let tv1 = tv0.clone();


    
    this.rotateSlab = s=>{
        if (rotating)
            return;
        playSound({name:'spin'+((Math.random()*5)|0),detune:((Math.random()-.5)*500)|0})
    
        sortSlabs();
        rot.set(0, 0, 0);
        let face = (s / 6) | 0;
        let row = ((s % 6) / 2) | 0;
        let dir = s & 1;
        //console.log("face", face, "row", row, "dir", dir);

        let c = qube.children;
        let slab = getSlab(face, row);
        rotor.rotation.set(0, 0, 0);
        let hPI = Math.PI * 0.5;
        rotarget.set(face == 0 ? hPI : 0, face == 1 ? hPI : 0, face == 2 ? hPI : 0).multiplyScalar(dir ? -1 : 1);
        rotating = true;
        slab.forEach(s=>rotor.attach(s));
        history.push(s);
        status.innerText = 'h:'+history.length+ ' m:'+s+' '
    }
    this.handleKey = e=>{
        let k = km.indexOf(e.code);
        k >= 0 && this.rotateSlab(k);
    }
    this.shuffle = false
    let shufIndex = 0;
    this.doShuffle = ()=>{
        if (this.shuffle){
            this.rotateSlab(shufIndex);//
            shufIndex+=(1+((Math.random() * 16) | 0));
            shufIndex%=18;
        }
    }
    let solved

    let rotation={
        speed:.33
    }
    gui.addFolder('rotation').add(rotation,'speed',0.1,1.);

    let roquat;
    this.update = ()=>{
        if (rotating) {

            if(!roquat){
                roquat = new THREE.Quaternion().setFromEuler(new THREE.Euler().set(rotor.rotation.x+rotarget.x,rotor.rotation.y+rotarget.y,rotor.rotation.z+rotarget.z));
            }
            rotor.quaternion.slerp(roquat,rotation.speed)
            /*
            rotor.rotation.x += rotarget.x * rotation.speed;
            rotor.rotation.y += rotarget.y * rotation.speed;
            rotor.rotation.z += rotarget.z * rotation.speed;
            */
            
            tv1.copy(rotor.rotation);
            tv1.sub(rotarget);
            if (tv1.length() < 0.01) {
                rotating = false;
                roquat=undefined;
                let c = rotor.children.slice(0);
                rotor.rotation.set(rotarget.x, rotarget.y, rotarget.z, "XYZ");
                c.forEach(k=>qube.attach(k));

                sortSlabs();
                let wasSolved = solved;
                solved = isSolved()
                if(solved&&(!wasSolved)){
                    playSound({name:'done'})
                    history.lenght = 0;
                    
                }
                let i = status
                i && (i.innerText += solved ? ' SOLVED' : " UNSOLVED");
                i &&(i.style.color = (solved) ?'green':'red')

            }
        }
        this.doSolve();
        this.doShuffle();
    }
    let v0 = new THREE.Vector3()
    let v1 = new THREE.Vector3()
    let v2 = new THREE.Vector3()
    let {abs} = Math;
    let toSide = v0.clone().set(12, 6, 0)

    let maxAxis = this.maxAxis = (v0)=>{
        v1.set(abs(v0.x), abs(v0.y), abs(v0.z));
        let ax = 'x'
        if (v1.y > v1.x)
            ax = 'y'
        if (v1.z > v1[ax])
            ax = 'z';
        return ax;
    }
    let idx = 0;
    let actionCode;
    this.drag = (startHits,endHits)=>{
        if (rotating)
            return;
        let start = startHits[0].point;
        let end = endHits[0].point
        v0.copy(start)
        let faceAxis = maxAxis(v0);
        let pos = (v0[faceAxis] > 0) ? 1 : 0;
        status.innerText = 'face:' + (pos ? '+' : '-') + faceAxis
        let code = pos ? faceAxis.toUpperCase() : faceAxis;
        v0.copy(end).sub(start);
        let dragAxis = maxAxis(v0);
        let dpos = (v0[dragAxis] > 0) ? 1 : 0;
        status.innerText += ' dragDir:' + (dpos ? '+' : '-') + dragAxis
        code += dpos ? dragAxis.toUpperCase() : dragAxis;
        v0.copy(start)
        v0[faceAxis] = 0;
        v0[dragAxis] = 0;
        let slab = v0.x + v0.y + v0.z;
        slab = ((slab + 3) / 2) | 0;
        code += slab;
        status.innerText += ' slab:' + slab
        actionCode = code;
        let ud = undefined;
        let moveMap = {
            Xz0: 6,
            XZ0: 7,
            Xz1: 8,
            XZ1: 9,
            Xz2: 10,
            XZ2: 11,
            XY0: 12,
            Xy0: 13,
            XY1: 14,
            Xy1: 15,
            XY2: 16,
            Xy2: 17,

            xZ0: 6,
            xz0: 7,
            xZ1: 8,
            xz1: 9,
            xZ2: 10,
            xz2: 11,
            xy0: 12,
            xY0: 13,
            xy1: 14,
            xY1: 15,
            xy2: 16,
            xY2: 17,

            ZX0: 6,
            Zx0: 7,
            ZX1: 8,
            Zx1: 9,
            ZX2: 10,
            Zx2: 11,
            Zy0: 0,
            ZY0: 1,
            Zy1: 2,
            ZY1: 3,
            Zy2: 4,
            ZY2: 5,

            zx0: 6,
            zX0: 7,
            zx1: 8,
            zX1: 9,
            zx2: 10,
            zX2: 11,
            zY0: 0,
            zy0: 1,
            zY1: 2,
            zy1: 3,
            zY2: 4,
            zy2: 5,

            Yx0: 12,
            YX0: 13,
            Yx1: 14,
            YX1: 15,
            Yx2: 16,
            YX2: 17,
            YZ0: 0,
            Yz0: 1,
            YZ1: 2,
            Yz1: 3,
            YZ2: 4,
            Yz2: 5,

            yX0: 12,
            yx0: 13,
            yX1: 14,
            yx1: 15,
            yX2: 16,
            yx2: 17,
            yz0: 0,
            yZ0: 1,
            yz1: 2,
            yZ1: 3,
            yz2: 4,
            yZ2: 5,

        }
        let moveId = moveMap[code]

        if (moveId !== undefined)
            this.rotateSlab(moveId);
        status.innerText += ' code:' + code + ' moveID:' + moveId
        /*
        */
    }
    document.addEventListener('keydown', e=>{
        if (e.code == 'Space') {
            idx %= 18;
            status.innerText = actionCode + ' id:' + idx
            this.rotateSlab(idx);
            //side+dir);
            idx++;
        }
    }
    )
}
