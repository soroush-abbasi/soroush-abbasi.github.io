let container = document.getElementById("canvas-container")

var background ;
var resources ;
const app = new PIXI.Application({
  resolution : window.devicePixelRatio,
  width: 1280 ,
  height: 720 ,

});

//container.appendChild(app.view) ;
container.appendChild(app.view) ;

app.loader.add('neural', 'images/wallpaper1.png');
app.loader.load(setup);
app.renderer.plugins.interaction.autoPreventDefault = false;
app.renderer.view.style.touchAction = 'auto';


function setup(loader, resources) {
    stage = app.stage ;
    background = new PIXI.Sprite(resources.neural.texture);
    app.stage.addChild(background);
    background.width = 1280;
    background.height = 720;

    //radius = 900 ;
    ////background.filterArea = new PIXI.Rectangle(0, 0, (radius ) * 2, (radius ) * 2);

    //colorMatrix = [
    ////R  G  B  A
    //  1, 0, 0, 0,
    //  0, 1, 0, 0,
    //  0, 0, 1, 0,
    //  0, 0, 0, 1
    //];
    //filter = new PIXI.filters.ColorMatrixFilter();
    //filter.matrix = colorMatrix;
    //stage.filters = [filter];
    //stage.filterArea = new PIXI.Rectangle(0, 0, (radius ) * 2, (radius ) * 2);
    ////background.filter = filter ;

    //filter.brightness(0.4, false);

    const shaderFrag = `
    precision highp float;
    uniform sampler2D uSampler;
    varying vec2 vTextureCoord;

    uniform vec2 mouse;
    uniform vec4 inputSize;
    uniform vec4 outputFrame;
    uniform float time;
    uniform float innerRadius ;


    void main() {
      vec2 screenPos = vTextureCoord * inputSize.xy + outputFrame.xy;
      float dist = length(mouse - screenPos) ;
      float inR = innerRadius ;
      float outR = inR + 60.0 ;
      float opat = 1.25*min(1.0 , inR / 70.0) ; 

          float mid = (outR + inR) / 2.0 ;
          float mDist = (( dist - mid ) * ( dist - mid )) / ((outR - inR)*(outR - inR)) ;
          float r = exp(-0.09 * pow((dist - mid)/20.0 , 2.0)) ;
          gl_FragColor = texture2D(uSampler, vTextureCoord) * 1.0 * (r*(opat) + 1.0) ;


    }
    `;
    const blurFilter = new PIXI.filters.BlurFilter();
    //const con = new PIXI.Sprite(resources.grass.texture);
    ////con.filterArea = new PIXI.Rectangle(0, 0, app.screen.width - 500, app.screen.height - 500);
    //app.stage.addChild(con);
    const filter = new PIXI.Filter(null, shaderFrag, {
        mouse: new PIXI.Point(),
        innerRadius: 0.0
    });
    background.filters = [filter,blurFilter];
    //filter.uniforms.mouse.copyFrom(new PIXI.Point(100,100)) ;
    sign = 1 ;


    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // get scroll position in px
    g_Time = (new Date()).getTime() ;


    app.ticker.speed = 1.6 ;
    app.ticker.maxFPS = 25 ;
    var fps = 0 ;

    app.ticker.add((delta) => {
      // var timeNow = (new Date()).getTime();
      // var timeDiff = timeNow - g_Time;
      // fps = fps + 1 ;
      // if (timeDiff > 1000)
      // {
      //   console.log(fps) ;
      //   fps = 0 ;
      //   g_Time = timeNow ;
      // }


      // var timeNow = (new Date()).getTime();
      // var timeDiff = timeNow - g_Time;
      // if (timeDiff < 30)
      //    return ;
      //
      // g_Time = timeNow ;

       //console.log(app.view.width)
       filter.uniforms.innerRadius += delta*sign ;

       // console.log(filter.uniforms.innerRadius)
       filter.uniforms.mouse = new PIXI.Point(background.width / 1.9 , background.height / 2.5);
       if (filter.uniforms.innerRadius < 1.0)
           sign = 1

        if (filter.uniforms.innerRadius > background.width / 1.4) {
            // sign = -1
            filter.uniforms.innerRadius = 0.0
        }
       // if( filter.uniforms.innerRadius < 1.0 || filter.uniforms.innerRadius > background.width / 1.7)
       // {
       //   sign *= -1 ;
       // }


       var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
       scrollTop = Math.min(scrollTop,1000)
       const blurAmount = scrollTop/document.documentElement.clientHeight ;
       blurFilter.blur = 20*blurAmount ;
       //console.log(blurAmount) ;
       //container.style.backgroundImage = "url(" + app.view.toDataURL() + ")";
        //container.setAttribute("style", "background-position: center center; background-repeat: no-repeat;") ;

    });

}
