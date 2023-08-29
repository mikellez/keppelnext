/* 
  EXPLANATION OF QRCode MODULE

  This module is responsbile for the generation of QR Codes. 
  These QR Codes are used to redirect users to submitting a request or
  to submit a feedback.
  A QR Code generated for request is tagged to an asset.
  A QR Code generated for feedback is tagged to a plant location

  This page contains 2 separate functional components
  
  - QRAssetImg - THE QR Code component for an asset (request)
  - QRFeedbackImg - The QR Code component for a plant location (feedback)

  These components can be clicked on the be download by the users on this module.
  The downloading logic is handled by the html2canvas and downloadjs library
*/

import formStyles from "../styles/formStyles.module.css";
import styles from "../styles/QRCode.module.css";

import React, { useState, useRef, useEffect } from "react";
import getConfig  from "next/config";

const { publicRuntimeConfig } = getConfig();
const { feedbackApiBaseUrl } = publicRuntimeConfig;

import {
  ModuleMain,
  ModuleHeader,
  ModuleContent,
  ModuleFooter,
  ModuleDivider,
} from "../components/";
import { useAsset } from "../components/SWR";
import { useQRCode } from "next-qrcode";
import { CMMSAsset, CMMSPlant, CMMSPlantLoc } from "../types/common/interfaces";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import instance from "../axios.config";
import { set } from "nprogress";
import AssetSearchBar from "../components/SearchBar/AssetsSearchBar";
import downloadjs from "downloadjs";
import html2canvas from "html2canvas";

async function handleCaptureClick(name: string, id: string) {
  // console.log(document.getElementById("qr"));
  if (document.getElementById(id)) {
    const canvas = await html2canvas(document.getElementById(id)!);
    const dataURL = canvas.toDataURL("image/png");
    downloadjs(dataURL, name, "image/png");
  }
  // console.log(canvas);
}

// function saveSvg(svgEl: SVGSVGElement, name: string) {
//   svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
//   var svgData = svgEl.outerHTML;
//   var preface = '<?xml version="1.0" standalone="no"?>\r\n';
//   var svgBlob = new Blob([preface, svgData], {
//     type: "image/svg+xml;charset=utf-8",
//   });

//   var svgUrl = URL.createObjectURL(svgBlob);
//   var downloadLink = document.createElement("a");
//   downloadLink.href = svgUrl;
//   downloadLink.download = name;
//   document.body.appendChild(downloadLink);
//   downloadLink.click();
//   document.body.removeChild(downloadLink);
// }

function QRAssetImg({
  asset,
  plant,
  isFeedback,
  my_id,
}: {
  asset: CMMSAsset;
  plant: number | null;
  isFeedback: boolean;
  my_id: string;
}) {
  const { SVG } = useQRCode();
  // function downloadQR(e: React.MouseEvent<HTMLButtonElement>) {
  //   const svg = e.currentTarget.querySelector("svg");
  //   // console.log(svg);

  //   if (!svg) return;

  //   saveSvg(svg, asset.asset_name);
  // }

  return (
    <button
      className={"btn btn-secondary " + styles.btnQr}
      onClick={() => handleCaptureClick(my_id, asset.asset_name)}
      id={my_id}
    >
      {isFeedback ? (
        <SVG
          text={
            feedbackApiBaseUrl +
            "/Guest/Asset/feedback/" +
            plant +
            "/" +
            asset.psa_id
            // + asset.asset_name
          }
          options={{
            level: "H",
            margin: 0,
            scale: 5,
            width: 150,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          }}
        />
      ) : (
        <SVG
          text={
            window.location.origin +
            "/Guest/Asset/" +
            plant +
            "/" +
            asset.psa_id
          }
          options={{
            level: "H",
            margin: 0,
            scale: 5,
            width: 150,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          }}
        />
      )}
      <div className={styles.label}>{asset.asset_name}</div>
    </button>
  );
}

interface NewAssetProps {
  plants: CMMSPlant[];
}
interface OptionProps {
  assetData: CMMSAsset;
  optionIdx: number;
}

function QRCode(props: NewAssetProps) {
  const [selectedPlant, setSelectedPlant] = useState<number | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<CMMSAsset[]>([]);
  const [feedback, setFeedback] = useState<boolean>(false);
  const [plantLocs, setPlantLocs] = useState<CMMSPlantLoc[]>([]);
  const [filteredPlantLocs, setFilteredPlantLocs] = useState<CMMSPlantLoc[]>(
    []
  );
  const searchRef = useRef({ value: "" });
  const [filteredAssets, setFilteredAssets] = useState<OptionProps[]>([]);
  const [selectedPlantLoc, setSelectedPlantLoc] = useState<number | null>(null);
  const [selectedLocString, setSelectedLocString] = useState<string>("");
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const qrRef = useRef() as React.RefObject<HTMLDivElement>;

  const { data, error, isValidating, mutate } = useAsset(selectedPlant);
  const [assetsOptions, setAssetOptions] = useState<OptionProps[]>();

  function assetSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    if (data) {
      //   console.log(e.target.options[20].value);
      // console.log(selectedAssets);
      const newAsset = Array.from(e.target.options)
        .filter((o) => o.selected)
        .map((o) => {
          // console.log(o);
          // console.log(data);
          return data[parseInt(o.value)];
        });
      // console.log(newAsset);
      const left = selectedAssets.filter((ele) => {
        if (ele.psa_id === newAsset[0].psa_id) {
          return true;
        } else {
          return false;
        }
      }).length;
      // console.log(newAsset, selectedAssets);

      if (left == 0) {
        setSelectedAssets(selectedAssets.concat(newAsset));
      }
    }
  }

  function assetDelete(e: React.ChangeEvent<HTMLSelectElement>) {
    if (selectedAssets && data) {
      const newAss = selectedAssets.filter((asset) => {
        // console.log(asset);
        // console.log(selectedAssets[parseInt(e.target.value) + 1]);
        // console.log(asset);
        return asset.psa_id != selectedAssets[parseInt(e.target.value)].psa_id;
      });
      // console.log(newAss);
      setSelectedAssets(newAss);
    }
  }

  // feedback
  useEffect(() => {
    const plantLocations = instance
      .get<CMMSPlantLoc[]>(`/api/plantLocation`)
      .then((res: any) => {
        setPlantLocs(res.data);
      });
  }, []);

  useEffect(() => {
    if (feedback) {
      setFilteredPlantLocs(() => {
        return plantLocs.filter((loc) => loc.plant_id === selectedPlant);
      });
    } else {
      if (assetsOptions) {
        setFilteredAssets(assetsOptions);
      }
    }
    var i = 0;
    if (data && initialLoad) {
      console.log("data : " + data);
      const options = data!.map((ele) => {
        return { assetData: ele, optionIdx: i++ };
      });
      // console.log(options);
      setAssetOptions(options);
      setFilteredAssets(options);
      setInitialLoad(true);
    }
  }, [selectedPlant, data]);

  // useEffect(() => {
  //   if (assetsOptions) setFilteredAssets(assetsOptions!);
  // }, [assetsOptions]);

  useEffect(() => {
    if (selectedPlantLoc) {
      setSelectedLocString(
        filteredPlantLocs.filter((loc) => loc.id == selectedPlantLoc)[0]
          .location
      );
    }
  }, [selectedPlantLoc]);

  function searchAssets() {
    const currRef = searchRef.current.value;
    if (data) {
      setFilteredAssets(
        assetsOptions!.filter((op) =>
          op.assetData.asset_name.toLowerCase().includes(currRef.toLowerCase())
        )
      );
    }
  }

  const QRFeedbackImg = ({ loc_id }: { loc_id: number | null }) => {
    const { SVG } = useQRCode();
    const location = plantLocs.filter((loc) => loc.id === loc_id)[0].location;
    // console.log(location);
    // function downloadQR(e: React.MouseEvent<HTMLButtonElement>) {
    //   const svg = e.currentTarget.querySelector("svg");

    //   if (!svg) return;
    //   console.log("downloading", location);

    //   saveSvg(svg, location + ".svg");
    // }
    const id = "feedback" + loc_id;
    return (
      <button
        className={"btn btn-secondary " + styles.btnQr}
        onClick={() => handleCaptureClick(location, id)}
        id={id}
      >
        <SVG
          text={ + "/Guest/Feedback/" + loc_id}
          options={{
            level: "H",
            margin: 0,
            scale: 5,
            width: 150,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          }}
        />
        <div className={styles.label}>{selectedLocString}</div>
      </button>
    );
  };

  return (
    <ModuleMain>
      <ModuleHeader title="QRCode" header="Generate QR Codes"></ModuleHeader>
      <ModuleContent includeGreyContainer grid>
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">Type:</label>
            <select
              className="form-select"
              required
              onChange={(e) => {
                setFeedback(e.target.value == "true");
              }}
            >
              <option value="0" disabled hidden selected>
                -- Select Type --
              </option>
              <option value="false">Fault</option>
              <option value="true">Feedback</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Plant:</label>
            <select
              className="form-select"
              required
              onChange={(e) => {
                // console.log(e.target.value);
                setSelectedPlant(parseInt(e.target.value));
                setInitialLoad(true);
                // console.log(selectedPlant);
              }}
            >
              <option value="0" disabled hidden selected>
                -- Select Plant --
              </option>
              {props.plants.map((plant) => (
                <option key={plant.plant_id} value={plant.plant_id}>
                  {plant.plant_name}
                </option>
              ))}
            </select>
          </div>

          {feedback && selectedPlant && (
            <div className="form-group">
              <label className="form-label">Plant Location:</label>
              <select
                className="form-select"
                required
                onChange={(e) => {
                  setSelectedPlantLoc(parseInt(e.target.value));
                }}
              >
                <option value="0" disabled hidden selected>
                  -- Select Plant Location --
                </option>
                {filteredPlantLocs.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.location}
                  </option>
                ))}
              </select>
            </div>
          )}

          <br />
        </div>
        <div className={formStyles.halfContainer}>
          {!feedback && (
            <>
              <label className="form-label">Selected Assets:</label>
              <div className="form-group">
                <select
                  className="form-select"
                  multiple
                  style={{ height: "14em" }}
                  onChange={assetDelete}
                  defaultValue={["0"]}
                >
                  {selectedAssets &&
                    selectedAssets.map((asset, i) => (
                      <option key={asset.psa_id} value={i}>
                        {asset.asset_name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assets:</label>
                <div>
                  <AssetSearchBar
                    ref={searchRef}
                    onSubmit={searchAssets}
                    onChange={searchAssets}
                  ></AssetSearchBar>
                </div>
                <select
                  className="form-select"
                  multiple
                  style={{ height: "14em" }}
                  onChange={assetSelect}
                  defaultValue={["0"]}
                >
                  <option value="0" disabled hidden selected>
                    -- Select Asset --
                  </option>
                  {filteredAssets &&
                    filteredAssets.map((opt) => (
                      <option key={opt.assetData.psa_id} value={opt.optionIdx}>
                        {opt.assetData.asset_name}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}
        </div>
      </ModuleContent>

      <ModuleContent>
        {!feedback && (
          <div className={styles.qrList} ref={qrRef}>
            {selectedAssets.map((asset) => {
              return (
                <QRAssetImg
                  key={asset.psa_id}
                  asset={asset}
                  plant={selectedPlant}
                  isFeedback={feedback}
                  my_id={asset.asset_name}
                />
              );
            })}
          </div>
        )}
        {feedback && (
          <div className={styles.qrList} ref={qrRef}>
            {selectedPlantLoc && <QRFeedbackImg loc_id={selectedPlantLoc} />}
          </div>
        )}
      </ModuleContent>
    </ModuleMain>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const headers = {
    withCredentials: true,
    headers: {
      Cookie: context.req.headers.cookie,
    },
  };
  // API to get plants, systems, asset types
  const plants = await instance.get<CMMSPlant[]>(`/api/getPlants`, headers);

  if (plants.status !== 200) throw Error("Error getting plants");

  let props: NewAssetProps = {
    plants: plants.data,
  };

  return {
    props: props,
  };
};

export default QRCode;
