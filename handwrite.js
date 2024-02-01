
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

var VSHADER_SOURCE = document.getElementById('VShader').textContent ;

var brushColorSet = [
"gl_FragColor = vec4(0.2 , 0.33 , 0.50 , 1.0) ;", // Blue
"gl_FragColor = vec4(0.84 , 0.40 , 0.20 , 1.0) ;", // Orange
"gl_FragColor = vec4(0.67 , 0.37 , 0.53 , 1.0) ;", // Purple
"gl_FragColor = vec4(0.0 , 0.36 , 0.22 , 1.0) ;", // Green
"gl_FragColor = vec4(0.69 , 0.0 , 0.40 , 1.0) ;", // Pink
"gl_FragColor = vec4(0.73 , 0.24 , 0.25 , 1.0) ;", // Red
"gl_FragColor = vec4(0.49 , 0.31 , 0.0 , 1.0) ;" // Brown
]
var brushSelector = getRandomInt(7)
FSHADER_SOURCE = "precision mediump float ; void main() {" + brushColorSet[brushSelector] + "}"
	 
	 
var vertices = [] ;
var lines = [] ;
var numOfSplines = 0 ;
var splinesControlPoints ;
var animationTime = 2000 ;
var myFont = [] ;
var spaceDistance = 0.4 ;
var verticesBuffer = [] ;
var headOfTheLine = -2.5 ;
var charSpace = 0.05 ;

function binomialCoeffs (n)
{
	for(var k = 0 ; k <= n; k++)
	{
		BC[k] = 1 ;
		for(var j = n; j >= k+1; j--)
			BC[k] *= j ;
		for(j=n-k; j>=2; j--)
			BC[k] /= j;
	}
}

function getBezierCurve(bezierControlPoints , nBezierControlPoints , curvePoints)
{
	BC = [] ;
	binomialCoeffs(nBezierControlPoints - 1) ;
	var lineArray = [] ;
	var p1 , p2 ;
	p1 = [bezierControlPoints[0] , bezierControlPoints[1]] ;
	if(nBezierControlPoints == 1)
		return [p1[0],p1[1],p1[0],p1[1]] ;
	if(nBezierControlPoints == 0)
		return [] ;
	for(var k = 0 ; k <= curvePoints ; k++)
	{
		var u = k / curvePoints ;
		p2 = computeBezierPoint(u , bezierControlPoints , nBezierControlPoints) ;
		lineArray = lineArray.concat(p1[0],p1[1],p2[0],p2[1]) ;
		p1 = p2 ;
	}
	return lineArray ;
}

function computeBezierPoint(u , bezierControlPoints , nBezierControlPoints)
{
	var n = nBezierControlPoints - 1 ;
	var bezBlendingFunction ;
	var x = 0 ; var y = 0 ;
	for (var k = 0 ; k < nBezierControlPoints ; k++)
	{
		bezBlendingFunction = BC[k]*Math.pow(u,k)*Math.pow(1-u,n-k) ;
		x += bezierControlPoints[2*k] * bezBlendingFunction ;
		y += bezierControlPoints[2*k+1] * bezBlendingFunction ;
	}
	return [x,y] ;

}

function readTextFile(file)
{
    var allText ;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return allText ;
}






function mFontParser(txt , scaleX , scaleY)
{
	var numOfSplinesTXT = /numOfSplines:[0-9]+/g.exec(txt) ;
	numOfSplines = parseInt(/[0-9]+/g.exec(numOfSplinesTXT)) ;

	var controlPointsTXT = /controlPoints:(\n|.)+/.exec(txt) ;
	var pat = /\/(\.|\d|,|\n|\s|-)+/g ;
	var controlPointsListTXT = controlPointsTXT[0].match(pat) ;

	var positionTXT = /position:.*\n/.exec(txt) ;
	var pat = /(\.|\d|,|-)+/g ;
	var numberPatern = /(\.|\d|-)+/g ;
	var positionCordTXT = positionTXT[0].match(pat) ;
	var cordTXT = positionCordTXT[0].match(numberPatern) ;
	var fontPosition = [] ;
	fontPosition[0] = parseFloat(cordTXT[0]) ;
	fontPosition[1] = parseFloat(cordTXT[1]) ;

	var font = [] ;
	font['numOfSplines'] = numOfSplines ;
	font['splines'] = [] ;


	for(var i = 0 ; i < numOfSplines ; i++)
	{
		var pointsTXT = controlPointsListTXT[i] ;
		var controlPoints = [] ;
		var pat = /(\.|\d|,|-)+/g ;
		var numberPatern = /(\.|\d|-)+/g ;
		var line = pointsTXT.match(pat) ;
		for(var j = 0 ; j < line.length ; j++)
		{
			var cordTXT = line[j].match(numberPatern) ;
			controlPoints[2*j] = parseFloat(cordTXT[0])*scaleX ;
			controlPoints[2*j+1] = parseFloat(cordTXT[1])*scaleY ;
		}
		font['splines'][i] = controlPoints ;
		font['size'] = 0.7 ;
		font['FontPosition'] = fontPosition ;
	}
	return font ;
}




function initModelFont()
{
	//a = 61
	for(var i = 0 ; i < 26 ; i++)
	{
		var txt = readTextFile("https://raw.githubusercontent.com/soroush-abbasi/soroush-abbasi.github.io/main/Font/"+ String.fromCharCode(i+97) +".mFont") ;
		if( i == 8)// i
			myFont[i+32] = mFontParser(txt , 0.6 , 0.6) ;
		else if( i == 0)// a
			myFont[i+32] = mFontParser(txt , 0.7 , 0.7) ;
		else if( i == 1)//b
			myFont[i+32] = mFontParser(txt , 1.0 , 1.0) ;
		else
			myFont[i+32] = mFontParser(txt , 1.0 , 1.0) ;
	}
	//A =
	for(var i = 0 ; i < 26 ; i++)
	{
		var txt = readTextFile("https://raw.githubusercontent.com/soroush-abbasi/soroush-abbasi.github.io/main/Font/_"+ String.fromCharCode(i+65) +".mFont") ;
		if( i == 0)//A
			myFont[i] = mFontParser(txt , 1.5 , 1.5) ;
		else if( i == 1)//b
			myFont[i] = mFontParser(txt , 1.0 , 1.0) ;
		else
			myFont[i] = mFontParser(txt,1.0 , 1.0) ;
	}
	

	
	

	// // writing the JSON string content to a file
	// fs.writeFile("data.json", data, (error) => {
	// // throwing the error
	// // in case of a writing problem
	// if (error) {
	// // logging the error
	// console.error(error);
	
	// throw error;
	// }
	
	// console.log("data.json written correctly");
	// });

}

var keyBuffer = [] ;
var keyBufferSize = 0 ;


function drawString()
{


	

	
	var wordsY = [0,1] ;
	var headLineOffsetPerLine = [0,1.0] ;
	var verticalSpace = -2.0 ;
	var currentLine = 0 ;
	var string = "Soroush ABbaxiz" ;

	var fontSize = 1.0 ;
	animationTime = 20000 ;
	keyBufferSize = string.length ;
	for(var i = 0 ; i < keyBufferSize ; i++)
		keyBuffer[i] = string.charCodeAt(i) - 65 ;
	start = Date.now() ;
	var mLines = [] ;
    verticesBuffer = [] ;
    var cursorPosition = headOfTheLine ;
		wordIndex = 0 ;

    var data_dict = {} ; 
    for(var k = 0 ; k < keyBufferSize ; k++)
	    {
	 	 
		    
		var key = keyBuffer[k] ;  
	    	if(key == -33)
			continue;
		var cp_list = []
	    	for(var i = 0 ; i < myFont[key]['numOfSplines'] ; i++)
	    	{
			var cp = myFont[key]['splines'][i] ;
			cp_list.push(cp)
		}
		data_dict[key] = {'splines':cp_list, 'numOfSplines':myFont[key]['numOfSplines'], 'FontPosition':myFont[key]['FontPosition']};
	    }
	const data = JSON.stringify(data_dict);
	
	var a = window.document.createElement('a');
	a.href = window.URL.createObjectURL(new Blob([data], {type: 'text/csv'}));
	a.download = 'font.json';
	
	// Append anchor to body.
	document.body.appendChild(a);
	a.click();
	
	// Remove anchor from body
	document.body.removeChild(a);

    for(var k = 0 ; k < keyBufferSize ; k++)
    {
		var key = keyBuffer[k] ;
	    if(key == -33)//space
	    {
				wordIndex += 1 ;
		    cursorPosition += spaceDistance ;
		    continue ;
	    }

	    lines = [] ;
	    mLines = [] ;
	    var xBegin = 1000.0 ;
	    var xEnd = -1000.0 ;
	    
	    
	    for(var i = 0 ; i < myFont[key]['numOfSplines'] ; i++)
	    {
				var cp = myFont[key]['splines'][i] ;
				curv = [] ;
				curv = getBezierCurve(cp , cp.length / 2 , 100) ;
				lines = lines.concat(curv) ;
	    }
			myFont[key]['ypos'] = verticalSpace*wordsY[wordIndex] ;

			if(currentLine < wordsY[wordIndex])
			{
				currentLine = wordsY[wordIndex] ;
				cursorPosition = headOfTheLine + headLineOffsetPerLine[currentLine] ;
			}

	    var lastCharMinY = 10000 ;
			var lastCharMaxY = -10000 ;
			var currentCharMinY = 10000 ;
			var currentCharMaxY = -10000 ;
		if(k > 0)
		{
			for(var i = 0 ; i < lastChar.length/2 ; i++)
			{
				lastCharMinY = Math.min(lastCharMinY , lastChar[2*i+1]) ;
				lastCharMaxY = Math.max(lastCharMaxY , lastChar[2*i+1]) ;
			}
			for(var i = 0 ; i < lines.length/2 ; i++)
			{
				currentCharMinY = Math.min(currentCharMinY , lines[2*i+1]
										  +myFont[key]['FontPosition'][1] * fontSize) ;
				currentCharMaxY = Math.max(currentCharMaxY , lines[2*i+1]
										  +myFont[key]['FontPosition'][0] * fontSize) ;
			}
		}

		var minY = Math.max(lastCharMinY,currentCharMinY) ;
		var maxY = Math.min(lastCharMaxY,currentCharMaxY) ;
		if(k > 0)
		{
			for(var i = 0 ; i < lastChar.length/2 ; i++)
			{
				xBegin = Math.min(xBegin , lastChar[2*i]) ;
				if(minY <= lastChar[2*i+1] && lastChar[2*i+1] <= maxY)
					xEnd = Math.max(xEnd , lastChar[2*i]) ;
			}
			cursorPosition += ((xEnd - xBegin)+charSpace)*fontSize ;
		}

		lastChar = [] ;

	    for(var i = 0 ; i < lines.length/2 ; i++)
	    {
			mLines[7*i] = lines[2*i] ;
			mLines[7*i+1] = lines[2*i+1] ; // position
			lastChar[2*i] = lines[2*i] + myFont[key]['FontPosition'][0] * fontSize;
			lastChar[2*i+1] = lines[2*i+1] + myFont[key]['FontPosition'][1] * fontSize ;
			mLines[7*i+2] = fontSize ; // size : scale
			mLines[7*i+3] = cursorPosition ; //cursor postion
			mLines[7*i+4] =  myFont[key]['ypos']; //cursor postion y
			mLines[7*i+5] = myFont[key]['FontPosition'][0] * fontSize ;
			mLines[7*i+6] = myFont[key]['FontPosition'][1] * fontSize ;
	    }
	    verticesBuffer = verticesBuffer.concat(mLines) ;
    }
}


function main() {


  	var canvas = document.getElementById('webgl');
	// resetGL(canvas) ;cuon

	var gl = canvas.getContext("webgl") ;
	// var gl = canvas.getContext("webgl2") ;
  // var gl = getWebGLContext(canvas);
	// var mm = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE) ;
	// var line_width = 0.6 ;
  // // gl.lineWidth(mm[0]*line_width + mm[1]*(1-line_width));
	// const [minSize, maxSize] = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
	// // gl.lineWidth(1.7);
	// gl.lineWidth(minSize*line_width + maxSize*(1-line_width));
	gl.viewport(0 , 0 , 1700 , 500) ;
	
  	initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE) ;


  	initModelFont() ;

  // Set the vertex information

  gl.clearColor(1.0, 0.956, 0.909, 1.0);

  var FSIZE = 4 ;
  var BYTE_PER_VERTEX = 7 ;

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*BYTE_PER_VERTEX, 0);
  gl.enableVertexAttribArray(a_Position);

  var a_Scale = gl.getAttribLocation(gl.program, 'a_Scale');
  gl.vertexAttribPointer(a_Scale, 1, gl.FLOAT, false, FSIZE*BYTE_PER_VERTEX, FSIZE*2);
  gl.enableVertexAttribArray(a_Scale);

  var a_CursorPosition = gl.getAttribLocation(gl.program, 'a_CursorPosition');
  gl.vertexAttribPointer(a_CursorPosition, 1, gl.FLOAT, false, FSIZE*BYTE_PER_VERTEX, FSIZE*3);
  gl.enableVertexAttribArray(a_CursorPosition);

	var a_CursorPosition_y = gl.getAttribLocation(gl.program, 'a_CursorPosition_y');
	gl.vertexAttribPointer(a_CursorPosition_y, 1, gl.FLOAT, false, FSIZE*BYTE_PER_VERTEX, FSIZE*4);
	gl.enableVertexAttribArray(a_CursorPosition_y);

  var a_FontPosition = gl.getAttribLocation(gl.program, 'a_FontPosition');
  gl.vertexAttribPointer(a_FontPosition, 2, gl.FLOAT, false, FSIZE*BYTE_PER_VERTEX, FSIZE*5);
  gl.enableVertexAttribArray(a_FontPosition);

  var tick = function() {   // Start drawing
    draw(gl);
    requestAnimationFrame(tick, canvas);
  };
  tick();
	drawString() ;
}

var start = Date.now() ;

function add_to_vertices(vertices , i , offset_x , offset_y)
{
	 vertices.push(verticesBuffer[7*i] + offset_x) ;
	 vertices.push( verticesBuffer[7*i+1] + offset_y) ;
	 vertices.push( verticesBuffer[7*i+2]) ;
	 vertices.push( verticesBuffer[7*i+3]) ;
	 vertices.push( verticesBuffer[7*i+4]) ;
	 vertices.push( verticesBuffer[7*i+5]) ;
	 vertices.push( verticesBuffer[7*i+6]) ;
	 return vertices
}

function draw(gl)
{

	  var elapsed = Date.now() - start ;
	  if(elapsed > 25000)
		  drawString() ;
	  vertices = [] ;
	  var len = verticesBuffer.length/7 ;
	  var index = (elapsed/animationTime)*len ;
	  var previus_line_thickness_dir_x = 0
	  var previus_line_thickness_dir_y = 0
	  for(var i = 0 ; i < index ; i+=2)
	  {
	  	  delta_x = verticesBuffer[7*(i+1)] - verticesBuffer[7*(i)]
		  delta_y = verticesBuffer[7*(i+1)+1] - verticesBuffer[7*(i)+1]

		  if (delta_y == 0 && delta_x ==0)
		  	continue ;
		  // console.log(delta_x , delta_y)

		  thickness = 0.07
		  thickness_dir_x = delta_y
		  thickness_dir_y = -delta_x
		  norm = Math.sqrt(Math.pow(thickness_dir_x,2) + Math.pow(thickness_dir_y,2))

		  thickness_dir_x = (thickness_dir_x/norm)*thickness
		  thickness_dir_y = (thickness_dir_y/norm)*thickness



		  vertices = add_to_vertices(vertices , i+1 , 0 , 0)
		  vertices = add_to_vertices(vertices , i , 0 , 0)
		  vertices = add_to_vertices(vertices , i+1 , thickness_dir_x , thickness_dir_y)


		  vertices = add_to_vertices(vertices , i , 0 , 0)
		  vertices = add_to_vertices(vertices , i+1 , thickness_dir_x , thickness_dir_y)
		  vertices = add_to_vertices(vertices , i , thickness_dir_x , thickness_dir_y)

		  if (i > 0)
		  {
		  	vertices = add_to_vertices(vertices , i , 0 , 0) ;
		  	vertices = add_to_vertices(vertices , i , previus_line_thickness_dir_x , previus_line_thickness_dir_y) ;
		  	// console.log(thickness_dir_x)
		  	vertices = add_to_vertices(vertices , i , thickness_dir_x , thickness_dir_y) ;

		  }
		  previus_line_thickness_dir_x = thickness_dir_x
		  previus_line_thickness_dir_y = thickness_dir_y


		  // vertices = add_to_vertices(vertices , i+1 , 0 , 0)
		  // vertices = add_to_vertices(vertices , i+1 , thickness_dir_x , thickness_dir_y)
		  // vertices = add_to_vertices(vertices , i+2 , 0 , 0)



	  }

	  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices) , gl.DYNAMIC_DRAW) ;
	  gl.clear(gl.COLOR_BUFFER_BIT);
  	  gl.drawArrays(gl.TRIANGLES, 0, vertices.length/7);

  	  // gl.drawArrays(gl.TRIANGLES, 0, 20);
}
