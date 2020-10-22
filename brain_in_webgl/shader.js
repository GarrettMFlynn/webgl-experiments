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

    // Load OBJ File Vertices
    const response1 = await fetch('https://raw.githubusercontent.com/GarrettMFlynn/webgl-experiments/main/brain_in_webgl/lh.pial.obj');
    const text1 = await response1.text();
    const data1 = await parseOBJ(text1);
    const vertexData1 = data1.position

    const response2 = await fetch('https://raw.githubusercontent.com/GarrettMFlynn/webgl-experiments/main/brain_in_webgl/rh.pial.obj');
    const text2 = await response2.text();
    const data2 = await parseOBJ(text2);
    const vertexData2 = data2.position

    let vertexData = [...vertexData1,...vertexData2]
    // vertexData = vertexData.filter((element, index) => {
    //     return index % 100 === 0;
    // })

    // Alternative: Generic Point Clouds (defined in point-functions.js)
    // const vertexData = createPointCloud(shapes.sphereShell,1e5);


// createbuffer
// load vertexData into buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

// const colorBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

// create vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;
varying vec3 vColor;

uniform mat4 matrix;

void main() {
    vColor = vec3(1,1,1);
    gl_Position = matrix * vec4(position,1);
    gl_PointSize = 1.0;
}`);
    gl.compileShader(vertexShader);

// create fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
precision mediump float;
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor,0.2);
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
        matrix: gl.getUniformLocation(program, `matrix`)
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

    mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);
    // mat4.scale( modelMatrix, modelMatrix, [0.25,0.25,0.25]);
    mat4.rotateX(modelMatrix, modelMatrix, -Math.PI / 2);

    mat4.translate(viewMatrix, viewMatrix, [0, 0, 200]);
    mat4.invert(viewMatrix, viewMatrix);


    function animate() {
        requestAnimationFrame(animate)
        mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 500);
        mat4.multiply(mvMatrix, viewMatrix, modelMatrix)
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix)
        gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix)
        gl.drawArrays(gl.POINTS, 0, vertexData.length / 3);
    };

    animate()
}

main();
