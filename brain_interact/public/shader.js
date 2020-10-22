// The models in this code are by Anderson Winkler and are
// licensed under a Creative Commons Attribution-ShareAlike 3.0
// Unported License. The original work can be found at
// https://brainder.org/brain-for-blender.

async function main() {

    const canvas = document.querySelector('canvas')
    const gl = canvas.getContext('webgl')



    if (!gl) {
        throw new Error('WebGL not supported')
    }

    // Generate Point Clouds (defined in point-functions.js)
    const vertexData = await createPointCloud('brain',1e5); // or shapes.[shape]

// createbuffer
// load vertexData into buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    // let forceData = [];
    // for (let ind = 0; ind < vertexData.length/3; ind++){
    //     forceData = [...forceData,[0.5,0.5,0.5]]
    // }
    // const forceBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, forceBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(forceData), gl.STATIC_DRAW);

// create vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;

varying vec3 vColor;

uniform mat4 matrix;
uniform vec3 force;

void main() {
    vColor = vec3(1,1,1);
    gl_Position = matrix * vec4((position+force),1);
    gl_PointSize = 1.0;
}`);
    gl.compileShader(vertexShader);

// create fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
precision mediump float;
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor,1.0);
}
`);
    gl.compileShader(fragmentShader);

// create program
    const program = gl.createProgram();

// attach shaders to program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program)

// enable vertex attributes
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

// const colorLocation = gl.getAttribLocation(program,`color`);
// gl.enableVertexAttribArray(colorLocation);
// gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
// gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0,0);


// draw
    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);

// matrix code
    const uniformLocations = {
        matrix: gl.getUniformLocation(program, `matrix`),
        force: gl.getUniformLocation(program, `force`)
    };

    const modelMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,
        75 * Math.PI / 180, // vertical field-of-view (angle, radians)
        canvas.width / canvas.height, // aspect W/H
        1e-4, // near cull distance
        1e4, // far cull distance
    );

    const mvMatrix = mat4.create();
    const mvpMatrix = mat4.create();

    // mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
    // mat4.rotateY(modelMatrix, modelMatrix, -Math.PI / 2);

    mat4.rotateX(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2);
    mat4.translate(viewMatrix, viewMatrix, [0, 0, 200]);
    mat4.invert(viewMatrix, viewMatrix);


    // Enable events on mousehold in WebGL
    let holdStatus;
    let mouseEv;
    let moveStatus;
    let x;
    let y;
    let prev_x;
    let prev_y;
    let damping = .95;
    let diff_x = 0;
    let diff_y = 0;
    let scroll;

    canvas.onmousedown = function(ev){
        holdStatus = true;
        mouseEv = ev;
        x = ev.clientX;
        prev_x = x;
        y = ev.clientY;
        prev_y = y;
    };

    canvas.onmouseup = function(ev){
        holdStatus = false;
    };
    canvas.onmousemove = function(ev){
        mouseEv = ev;
        moveStatus = true;
        x = ev.clientX;
        y = ev.clientY;
    };

    canvas.onwheel = function(ev){
        scroll = ev.deltaY;
        console.log(scroll)

        mat4.translate(viewMatrix, viewMatrix, [scroll/100,0,0]);
    };

    function mouseState() {
        if (holdStatus && moveStatus) {
            diff_x = (x-prev_x);
            diff_y = (y-prev_y)
            prev_x = x;
            prev_y = y;
            // gl.uniform3fv(uniformLocations.force, new Float32Array([0, 50*x, 50*y]))
        }
    }

    function animate() {
        requestAnimationFrame(animate)
        mouseState()
        mat4.rotateY(modelMatrix, modelMatrix, diff_y*2*Math.PI/canvas.height);
        mat4.rotateZ(modelMatrix, modelMatrix, diff_x*2*Math.PI/canvas.width);
        mat4.multiply(mvMatrix, viewMatrix, modelMatrix)
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix)
        gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix)
        gl.drawArrays(gl.POINTS, 0, vertexData.length / 3);
        // gl.uniform3fv(uniformLocations.force, new Float32Array([0,0,0]))
        moveStatus = false;
        diff_x *= damping;
        diff_y *= damping;
    };


    animate()
}

main();
