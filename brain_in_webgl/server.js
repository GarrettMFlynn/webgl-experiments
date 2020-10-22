const express = require('express');

const app = express();

app.use(express.static('public'));

app.listen(3000);
console.log('Listening on http://localhost:3000/')

/* SAVE OBJ FILE AS A JSON FOR FASTER LOADING*/
// const fs = require('fs');
// const fetch = require("node-fetch");
// async function save() {
//     const response1 = await fetch('https://raw.githubusercontent.com/GarrettMFlynn/webgl-experiments/main/brain_in_webgl/rh.pial.obj');
//     const text1 = await response1.text();
//     const data1 = await parseOBJ(text1);
//
//     const data = await JSON.stringify(data1);
//
// // write JSON string to a file
//     await fs.writeFile('rh.pial.json', data, (err) => {
//         if (err) {
//             throw err;
//         }
//         console.log("JSON data is saved.");
//     });
// }
//
// save();
//
//
//
// // Functions
// function parseOBJ(text) {
//     // because indices are base 1 let's just fill in the 0th data
//     const objPositions = [[0, 0, 0]];
//     const objTexcoords = [[0, 0]];
//     const objNormals = [[0, 0, 0]];
//
//     // same order as `f` indices
//     const objVertexData = [
//         objPositions,
//         objTexcoords,
//         objNormals,
//     ];
//
//     // same order as `f` indices
//     let webglVertexData = [
//         [],   // positions
//         [],   // texcoords
//         [],   // normals
//     ];
//
//     function addVertex(vert) {
//         const ptn = vert.split('/');
//         ptn.forEach((objIndexStr, i) => {
//             if (!objIndexStr) {
//                 return;
//             }
//             const objIndex = parseInt(objIndexStr);
//             const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
//             webglVertexData[i].push(...objVertexData[i][index]);
//         });
//     }
//
//     const keywords = {
//         v(parts) {
//             objPositions.push(parts.map(parseFloat));
//         },
//         vn(parts) {
//             objNormals.push(parts.map(parseFloat));
//         },
//         vt(parts) {
//             // should check for missing v and extra w?
//             objTexcoords.push(parts.map(parseFloat));
//         },
//         f(parts) {
//             const numTriangles = parts.length - 2;
//             for (let tri = 0; tri < numTriangles; ++tri) {
//                 addVertex(parts[0]);
//                 addVertex(parts[tri + 1]);
//                 addVertex(parts[tri + 2]);
//             }
//         },
//     };
//
//     const keywordRE = /(\w*)(?: )*(.*)/;
//     const lines = text.split('\n');
//     for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
//         const line = lines[lineNo].trim();
//         if (line === '' || line.startsWith('#')) {
//             continue;
//         }
//         const m = keywordRE.exec(line);
//         if (!m) {
//             continue;
//         }
//         const [, keyword, unparsedArgs] = m;
//         const parts = line.split(/\s+/).slice(1);
//         const handler = keywords[keyword];
//         if (!handler) {
//             console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
//             continue;
//         }
//         handler(parts, unparsedArgs);
//     }
//
//     return {
//         // normalize model to between 0 and 1
//         position: webglVertexData[0],
//         texcoord: webglVertexData[1],
//         normal: webglVertexData[2],
//     };
// }
//
