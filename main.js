/// <reference path="../defs/babylon.d.ts" />
/// <reference path="../defs/babylon.gui.d.ts" />

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas);

//array to hold every box 
var boxArray = [];

//the boundaries of the world are stored here and initially set to 100
var worldBounds = 100;

//booleans to indicate whether or not the boxes should rotate or move
var boxesShouldRotate = true;
var boxesShouldMove = true;

//the box class will model the boxes that bounce around in the scene
class Box
{
    //the constructor takes in a babylon box mesh as an argument and will 
    //randomly generate values for all other properties of the box
    constructor(babylonBox)
    {
        this.babylonBox = babylonBox;
        this.velocityX = Math.random() * .5;
        this.velocityY = Math.random() * .5;
        this.velocityZ = Math.random() * .5;
        this.rotationX = Math.random() * .1;
        this.rotationY = Math.random() * .1;
        this.rotationZ = Math.random() * .1;
    }

    //generate a random color for the box 
    generateColor()
    {
        let boxMaterial = new BABYLON.StandardMaterial("material", scene);
        boxMaterial.emissiveColor = new BABYLON.Color3(Math.random() * 1, Math.random() * 1, Math.random() * 1);
        this.babylonBox.material = boxMaterial;
    }

    //generate a random x, y, and z location for the box 
    generateRandomLocation()
    {
        this.babylonBox.position.x = Math.random() * worldBounds;
        this.babylonBox.position.y = Math.random() * worldBounds;
        this.babylonBox.position.z = Math.random() * worldBounds;
    }

    //move() will update the boxes position and check for collision with world bounds.
    //this function has been made considerably more complex by the fact that 
    //it must account for the world bounds potentially shrinking. 
    //a check must be put into place making sure that the box is already going in the right direction
    //before it is given velocity in the opposite direction 
    //this is necessary because the boxes are otherwise unable to shrink their path to adapt
    //to smaller world bounds
    move()
    {
        if (this.babylonBox.position.x > worldBounds || this.babylonBox.position.x < 0)
        {
            if (this.babylonBox.position.x > worldBounds)
            {
                if (!this.goingInRightDirection(this.babylonBox.position.x, this.velocityX))
                {
                    this.velocityX *= -1;
                }
            }
            else
            {
                this.velocityX *= -1;
            }
        }
        if (this.babylonBox.position.y > worldBounds || this.babylonBox.position.y < 0)
        {
            if (this.babylonBox.position.y > worldBounds)
            {
                if (!this.goingInRightDirection(this.babylonBox.position.y, this.velocityY))
                {
                    this.velocityY *= -1;
                }
            }
            else
            {
                this.velocityY *= -1;
            }
        }
        if (this.babylonBox.position.z > worldBounds || this.babylonBox.position.z < 0)
        {
            if (this.babylonBox.position.z > worldBounds)
            {
                if (!this.goingInRightDirection(this.babylonBox.position.z, this.velocityZ))
                {
                    this.velocityZ *= -1;
                }
            }
            else
            {
                this.velocityZ *= -1;
            }
        }      
        this.babylonBox.position.x += this.velocityX;
        this.babylonBox.position.y += this.velocityY;
        this.babylonBox.position.z += this.velocityZ;
    }

    //given the current position and velocity of the box along the x, y, or z plane this will tell
    //whether or not it is headed in the right direction to be within the worlds bounds. 
    //This must be used in the boxes move function. 
    goingInRightDirection(position, velocity)
    {
        let currentDistanceFromWorldBoundary = position - worldBounds;
        let nextDistanceFromWorldBoundary = (position + velocity) - worldBounds;

        if(currentDistanceFromWorldBoundary < nextDistanceFromWorldBoundary)
        {
            return false;
        }
        else 
        {
            return true;
        }
    }

    //rotate the box 
    rotate()
    {
        this.babylonBox.rotation.x += this.rotationX;
        this.babylonBox.rotation.y += this.rotationY;
        this.babylonBox.rotation.z += this.rotationZ;
    }

}

var createScene = function()
{
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.8, 0.8, 0.8);

    var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(50, 50, 50), scene);
    light.intensity = .25;

    var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(50, 50, 50), scene);

    camera.attachControl(canvas, true);

    /*var wallPlane1 = BABYLON.MeshBuilder.CreatePlane("plane", {width: 100, height:100, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
    wallPlane1.position.x = 50;
    wallPlane1.position.y = 50;
    wallPlane1.position.z = -1;*/

    /*var wallPlane2 = BABYLON.MeshBuilder.CreatePlane("plane", {width: 100, height:100, sideOrientation: BABYLON.Mesh.DOUBLESIDE}, scene);
    wallPlane2.position.x = 50;
    wallPlane2.position.y = 50;
    wallPlane2.position.z = 101;*/

    //100 boxes are initially created 
    createBoxes(100);

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");
    var panel = new BABYLON.GUI.StackPanel();
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    panel.width = .25;
    advancedTexture.addControl(panel);

    var panel2 = new BABYLON.GUI.StackPanel();
    panel2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panel2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    var showButton = BABYLON.GUI.Button.CreateSimpleButton("but", "Hide Options");
    //showButton.width = .5;
    showButton.height = "40px";
    showButton.color = "white";
    showButton.background = "green";
    showButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    showButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    showButton.onPointerClickObservable.add(function(){togglePanelVisibility(showButton, panel2);});

    var button = BABYLON.GUI.Button.CreateSimpleButton("but", "Box Rotation: On");
    button.height = "40px";
    button.color = "white";
    button.background = "green";
    button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button.onPointerClickObservable.add(function(){toggleBoxRotation(button);});

    var button2 = BABYLON.GUI.Button.CreateSimpleButton("but", "Box Movement: On");
    button2.height = "40px";
    button2.color = "white";
    button2.background = "green";
    button2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button2.onPointerClickObservable.add(function(){toggleBoxMovement(button2);});

    var rect1 = new BABYLON.GUI.Rectangle();
    rect1.adaptHeightToChildren = true;
    rect1.color = "Yellow";
    rect1.thickness = 4;
    rect1.background = "green";

    var numberSliderText = new BABYLON.GUI.TextBlock();
    numberSliderText.text = "Number of Boxes: 100";
    numberSliderText.height = "30px";
    numberSliderText.color = "white";

    var numberSlider = new BABYLON.GUI.Slider();
    numberSlider.minimum = 0;
    numberSlider.maximum = 500;
    numberSlider.value = 100;
    numberSlider.height = "20px";
    numberSlider.color = "yellow";
    numberSlider.onValueChangedObservable.add(function(){numberSliderFunction(numberSliderText, numberSlider);});

    var numberSliderButton = new BABYLON.GUI.Button.CreateSimpleButton("but", "Apply");
    numberSliderButton.fontSize = 14;
    numberSliderButton.height = "40px";
    numberSliderButton.width = .5;
    numberSliderButton.color = "white";
    numberSliderButton.background = "green";
    numberSliderButton.onPointerClickObservable.add(function(){createBoxes(numberSlider.value);});


    var panel3 = new BABYLON.GUI.StackPanel();
    panel3.addControl(numberSliderText);
    panel3.addControl(numberSlider);
    panel3.addControl(numberSliderButton);
    rect1.addControl(panel3);

    var rect2 = new BABYLON.GUI.Rectangle();
    rect2.adaptHeightToChildren = true;
    rect2.color = "Yellow";
    rect2.thickness = 4;
    rect2.background = "green";

    var worldBoundsSliderText = new BABYLON.GUI.TextBlock();
    worldBoundsSliderText.text = "World Bounds: 100";
    worldBoundsSliderText.height = "30px";
    worldBoundsSliderText.color = "white";

    var worldBoundsSlider = new BABYLON.GUI.Slider();
    worldBoundsSlider.minimum = 0;
    worldBoundsSlider.maximum = 500;
    worldBoundsSlider.value = 100;
    worldBoundsSlider.height = "20px";
    worldBoundsSlider.color = "yellow";
    worldBoundsSlider.onValueChangedObservable.add(function(){worldBoundsSliderFunction(worldBoundsSliderText, worldBoundsSlider);});

    var worldBoundsSliderButton = new BABYLON.GUI.Button.CreateSimpleButton("but", "Apply");
    worldBoundsSliderButton.fontSize = 14;
    worldBoundsSliderButton.height = "40px";
    worldBoundsSliderButton.width = .5;
    worldBoundsSliderButton.color = "white";
    worldBoundsSliderButton.background = "green";
    worldBoundsSliderButton.onPointerClickObservable.add(function(){changeWorldBounds(worldBoundsSlider.value);});

    var panel4 = new BABYLON.GUI.StackPanel();
    panel4.addControl(worldBoundsSliderText);
    panel4.addControl(worldBoundsSlider);
    panel4.addControl(worldBoundsSliderButton);
    rect2.addControl(panel4);

    var rect3 = new BABYLON.GUI.Rectangle();
    rect3.adaptHeightToChildren = true;
    rect3.color = "Yellow";
    rect3.thickness = 4;
    rect3.background = "green";

    var controlsText = new BABYLON.GUI.TextBlock();
    controlsText.text = "Controls\nUse the arrow keys to move and\nleft click to rotate the camera";
    controlsText.height = "100px";
    controlsText.color = "white";
    controlsText.textWrapping = true;
    rect3.addControl(controlsText);

    panel.addControl(showButton);
    panel.addControl(panel2);
    panel2.addControl(button);
    panel2.addControl(button2);
    panel2.addControl(rect1);
    panel2.addControl(rect2);
    panel2.addControl(rect3);

    return scene;
}

var scene = createScene();

//while the renderLoop runs the movementManager must be invoked continuously to update the boxes
engine.runRenderLoop(function(){
    movementManager();
    scene.render();
});

//prevents the rendered image from getting blurry if the window is resized
window.addEventListener("resize", function () {
    engine.resize();
});

//responsible for moving and rotating all boxes
function movementManager()
{
    //if boxesShouldMove or boxesShouldRotate are false then the respective operation will not
    //be performed on the boxes
    if (boxesShouldMove)
    {
        for (var i = 0; i < boxArray.length; i++)
        {
            boxArray[i].move();
        }
    }
    if (boxesShouldRotate)
    {
        for (var i = 0; i < boxArray.length; i++)
        {
            boxArray[i].rotate();
        }
    }
}

//creates however many boxes are passed into it as an argument
function createBoxes(numberOfBoxes)
{
    //if there are pre existing boxes then they must be deleted first
    if(boxArray.length > 0)
    {
        deleteEveryBox();
    }
    for (var i = 0; i < numberOfBoxes; i++)
    {
        let boxMaterial = new BABYLON.StandardMaterial("material", scene);
        boxMaterial.emissiveColor = new BABYLON.Color3(Math.random() * 1, Math.random() * 1, Math.random() * 1);
        boxArray.push(new Box(BABYLON.Mesh.CreateBox("box", 2, scene)));
        boxArray[i].generateColor();
        boxArray[i].generateRandomLocation();
    }
}

//changes the value of the world bounds to whatever value is passed in as an argument 
function changeWorldBounds(newWorldBounds)
{
    console.log("World Bounds Before: " + worldBounds);
    let roundedWorldBounds = Math.round(newWorldBounds);
    worldBounds = roundedWorldBounds;
    console.log("World Bounds After: " + worldBounds);
}

function deleteEveryBox()
{ 
    //since the boxarray length will change in this loop
    //the value must be stored in a counter variable
    let counter = boxArray.length;
    for (var i = 0; i < counter; i++)
    {
        let box = boxArray.pop();
        box.babylonBox.dispose();
    }
}

//updates the text above the slider to match the slider's value 
function numberSliderFunction(sliderText, slider)
{
    let sliderValue = Math.round(slider.value);
    sliderText.text = "Number of Boxes: " + sliderValue;
}

function worldBoundsSliderFunction(sliderText, slider)
{
    let sliderValue = Math.round(slider.value);
    sliderText.text = "World Bounds: " + sliderValue;
}

function toggleBoxRotation(button)
{
    if (boxesShouldRotate)
    {
        button.children[0].text = "Box Rotation: Off";
    }
    else 
    {
        button.children[0].text = "Box Rotation: On";
    }
    boxesShouldRotate = !(boxesShouldRotate);
}

function toggleBoxMovement(button)
{
    if (boxesShouldMove)
    {
        button.children[0].text = "Box Movement: Off";
    }
    else 
    {
        button.children[0].text = "Box Movement: On";
    }
    boxesShouldMove = !(boxesShouldMove);
}

//shows or hides the options menu
function togglePanelVisibility(button, panel)
{
    if (panel.isVisible)
    {
        button.children[0].text = "Show Options";
    }
    else 
    {
        button.children[0].text = "Hide Options";
    }
    panel.isVisible = !(panel.isVisible);
}
