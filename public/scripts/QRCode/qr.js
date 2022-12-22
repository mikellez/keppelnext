import generateQRFromURL from "./generateQR.js"
import { Axios } from 'axios'

const HOST_URL = "192.168.20.93:3001";
const arrAssets = [];

console.log("adasdas")

function downloadHTML(filename, blob) {
	var a = document.createElement('a');
	a.href = window.URL.createObjectURL(blob);
	a.download = filename;

	a.style.display = 'none';
	document.body.appendChild(a);

	a.click();

	document.body.removeChild(a);
}
//Get all plant lists
async function getPlants()
{
	return await axios.get("/api/request/getPlantlist")
	.then((response) => {
		return response.data;
	})
	.catch((e) => {
		console.log("error getting plant list")
		return null;
	});
}

// gets assets depending on plant_id
async function getAssets(plant_id)
{
	return await axios.get("/api/request/getAssets/" + plant_id)
	.then((response) => {
		return response.data;
	})
	.catch((e) => {
		console.log("error getting assets")
		return null;
	});
}

// gets assets and inserts into asset list
function updateAssetList(plant_id)
{
	var assetList = document.getElementById("assetList");
	assetList.innerHTML = ""
	arrAssets.splice(0, arrAssets.length);									// clear array
	getAssets(plant_id).then((r) => {
		r.forEach(a => {
			var opt = document.createElement('option');
			opt.value = a.psa_id;
			opt.innerHTML = a.asset_name;
			assetList.appendChild(opt);
			arrAssets.push({"id": a.psa_id, "name": a.asset_name});
		});
	});
}

function processQR(arrSelectedAssets)
{
	const plant_id = document.getElementById("plantLocation").value;		// get plant id
	const plant_name = document.getElementById("plantLocation").options[document.getElementById("plantLocation").selectedIndex].text    // get plant name
	const qrElement = document.getElementById("qrcode");
	const arrPromises = [];
	const qrDoc = document.implementation.createHTMLDocument("QR Code");
	qrDoc.documentElement.innerHTML = "<head><style>#container{padding: 2em 2em 2em 2em;display:flex;flex-wrap:wrap;justify-content: space-around; font-size:22px;}#container div{padding: 0 1em 2.5em 1em;flex: 0 0 20%;}#container div img{margin: 0;position: relative;left: 50%;-ms-transform: translateX(-50%);transform: translate(-50%);image-rendering: crisp-edges;padding-bottom: 0.5em;}#container div div{text-align: center;}</style></head><body><div id='container'></div></body>";
	const qrDiv = qrDoc.getElementById("container");
	console.log(qrDiv);

	let i = 0
	arrSelectedAssets.forEach((asset) => {								// loop through array
		arrPromises.push(												// add async function promise to array
			generateQRFromURL(qrElement, "http://" + HOST_URL + "/html/Requests/request_create_guest.html?location=" + plant_name + "&asset=" + asset.text)
			// ^^^^ returns a promise
		);
		console.log("http://" + HOST_URL + "/html/Requests/request_create_guest.html?" + plant_name + "-" + asset.text);           
	});

	Promise.allSettled(arrPromises).then((results) => {                 // wait for all promises and generate QRs
		results.forEach((result) => {
			if(result.status === "rejected")
			{
				console.log(result);
				swal({
					title: "QR Code Generation Failed!",
					text: "Something went wrong",
					icon: "error",
				});
				return;
			}

		});

		const c = qrElement.getElementsByTagName("canvas");
		var opts = arrSelectedAssets;
		for(var i=0;i<c.length;i++)
		{
			var img = new Image();
			img.src = c[i].toDataURL();

			const qrSecondDiv = qrDoc.createElement("div");
			const qrTextDiv = qrDoc.createElement("div");

			qrSecondDiv.appendChild(img);

			qrTextDiv.innerHTML = plant_name + " - " + opts[i].innerText;
			qrSecondDiv.appendChild(qrTextDiv);

			qrDiv.appendChild(qrSecondDiv);
		}

		downloadHTML("qrcode.html", 
			new Blob(
				[new XMLSerializer().serializeToString(qrDoc)],
				{type: "text/html"}
			)
		)
		
		qrElement.innerHTML = "";
		
	});

	swal({
		title: "QR Code Generated!",
		text: "QR Code has been generated and is being downloaded",
		icon: "success",
	});
}

// fired when user clicks on generate QR code button
function startQRGeneration()
{
	const assetList = document.getElementById("assetList");             // get selected assets
	const arrSelecetedAssets = Array.from(                              // get selected options as array
		assetList.querySelectorAll("option:checked"),
		e=>e//.value
	);

	if(arrSelecetedAssets.length == 0)
	{
		return swal({
			title: "QR Code Generation Failed!",
			text: "No asset has been selected",
			icon: "error",
		});
	}

	if(arrSelecetedAssets.length > 40)
	{
		swal({
			title: "Are you sure?",
			text: arrSelecetedAssets.length + " QR codes are going to be generated. This might take a while",
			icon: "warning",
			dangerMode: true,
			buttons: true,
		}).then((result) => {
			if (result != null) {
				processQR(arrSelecetedAssets);
			}
		});
	}
	else
	{
		processQR(arrSelecetedAssets);
	}
}
/*
// once document is fully loaded
document.addEventListener("DOMContentLoaded", (e) => {
	console.log("adasd")
	// plant location drop down menu
	document.getElementById("plantLocation").addEventListener('change', () => {
		updateAssetList(document.getElementById("plantLocation").value)
	});

	// generate QR code button
	document.getElementById("generateButton").addEventListener('click', () => { startQRGeneration() });

	// get plants and loop through to add to selection
	var select = document.getElementById("plantLocation");
	getPlants().then((r) => {
		r.forEach(p => {
			var opt = document.createElement('option');
			opt.value = p.plant_id;
			opt.innerHTML = p.plant_name;
			select.appendChild(opt);
		});
	}); 
});*/
