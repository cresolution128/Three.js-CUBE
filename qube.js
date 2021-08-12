export default function Qube(THREE, scene, loader) {
    let {Vector3, Object3D, InstancedMesh} = THREE;
    let {floor, min, max, PI} = Math;
    let km = `QWERTYASDFGHZXCVBN`.split("").map(e=>"Key" + e);
    let qube;
    let imesh;
    let blks = [];
    let rbk = glb=>{
        let m = glb.scene.children[2];
        let box = m;
        let spacing = 1.0;
        qube = this.root = new Object3D();
        let nr = 1;
        let nstep = 1;
        imesh = new InstancedMesh(m.geometry,m.material,(nr * 2 + 1) ** 2);
        for (let i = -nr, bx; i <= nr; i += nstep)
            for (let j = -nr; j <= nr; j += nstep)
                for (let k = -nr; k <= nr; k += nstep) {
                    qube.add((bx = box.clone()));
                    bx.position.set(i, j, k).multiplyScalar(spacing);
                    blks.push(bx);
                }
        qube.scale.multiplyScalar(2);
        qube.traverse(e=>e.isMesh && (e.castShadow = e.receiveShadow = true));
        qube.updateMatrix(true)
        scene.add(qube);
        //scene.add(imesh)
    }
    ;
    new loader().load(`rbik.glb`, rbk);
    let rot = new Vector3();
    let tv0 = new Vector3();

    let isSolved = ()=>{
        let dist=0;
        tv0.copy(qube.children[0].rotation);
        qube.children.forEach(e=>tv1.copy(e.rotation) && (dist+=tv0.distanceToSquared(tv1)))
        console.log('-----',dist)
        return dist<.0001;
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
            (!e.userData.solvedLoc) && (e.userData.solvedLoc=loc.clone());
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
        sortSlabs();
        rot.set(0, 0, 0);
        let face = (s / 6) | 0;
        let row = ((s % 6) / 2) | 0;
        let dir = s & 1;
        console.log("face", face, "row", row, "dir", dir);
        let c = qube.children;
        let slab = getSlab(face, row);
        rotor.rotation.set(0, 0, 0);
        let hPI = Math.PI * 0.5;
        rotarget.set(face == 0 ? hPI : 0, face == 1 ? hPI : 0, face == 2 ? hPI : 0).multiplyScalar(dir ? -1 : 1);
        rotating = true;
        slab.forEach(s=>rotor.attach(s));

    }
    this.handleKey = e=>{
        let k = km.indexOf(e.code);
        k >= 0 && this.rotateSlab(k);
    }
    this.update = ()=>{
        if (rotating) {
            rotor.rotation.x += rotarget.x * 0.1;
            rotor.rotation.y += rotarget.y * 0.1;
            rotor.rotation.z += rotarget.z * 0.1;

            tv1.copy(rotor.rotation);
            tv1.sub(rotarget);
            if (tv1.length() < 0.15) {
                rotating = false;
                let c = rotor.children.slice(0);
                rotor.rotation.set(rotarget.x, rotarget.y, rotarget.z, "XYZ");
                c.forEach(k=>qube.attach(k));

            sortSlabs();
            let solved = isSolved()
            let i = document.getElementsByTagName('title')[0]
            i &&( i.innerText = solved?'SOLVED':"UNSOLVED")                

            }
        }
        blks.forEach((e,i)=>{
            e.updateMatrixWorld();
            imesh.setMatrixAt(i, e.matrixWorld);
        }
        )
    }
}
