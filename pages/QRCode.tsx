import formStyles from "../styles/formStyles.module.css";
import styles from "../styles/QRCode.module.css";

import React, { useState, useRef, useEffect } from "react";

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

function saveSvg(svgEl: SVGSVGElement, name: string) {
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var svgData = svgEl.outerHTML;
  var preface = '<?xml version="1.0" standalone="no"?>\r\n';
  var svgBlob = new Blob([preface, svgData], {
    type: "image/svg+xml;charset=utf-8",
  });

  var svgUrl = URL.createObjectURL(svgBlob);
  var downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function QRAssetImg({
  asset,
  plant,
  isFeedback,
}: {
  asset: CMMSAsset;
  plant: number | null;
  isFeedback: boolean;
}) {
  const { SVG } = useQRCode();
  function downloadQR(e: React.MouseEvent<HTMLButtonElement>) {
    const svg = e.currentTarget.querySelector("svg");
    // console.log(svg);

    if (!svg) return;

    saveSvg(svg, asset.asset_name);
  }

  return (
    <button
      className={"btn btn-secondary " + styles.btnQr}
      onClick={downloadQR}
    >
      {isFeedback ? (
        <SVG
          text={
            window.location.origin +
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
function QRCode(props: NewAssetProps) {
  const [selectedPlant, setSelectedPlant] = useState<number | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<CMMSAsset[]>([]);
  const [feedback, setFeedback] = useState<boolean>(false);
  const [plantLocs, setPlantLocs] = useState<CMMSPlantLoc[]>([]);
  const [filteredPlantLocs, setFilteredPlantLocs] = useState<CMMSPlantLoc[]>(
    []
  );
  const searchRef = useRef({ value: "" });
  const [filteredAssets, setFilteredAssets] = useState<CMMSAsset[]>([]);
  const [selectedPlantLoc, setSelectedPlantLoc] = useState<number | null>(null);
  const [selectedLocString, setSelectedLocString] = useState<string>("");

  const qrRef = useRef() as React.RefObject<HTMLDivElement>;

  const { data, error, isValidating, mutate } = useAsset(selectedPlant);

  function assetSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    if (data) {
      //   console.log(e.target.options[20].value);
      // console.log(selectedAssets);
      const newAsset = Array.from(e.target.options)
        .filter((o) => o.selected)
        .map((o) => data[parseInt(o.value)]);
      if (!selectedAssets.includes(newAsset[0])) {
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
      if (data) {
        setFilteredAssets(data);
      }
    }
  }, [selectedPlant, data]);

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
        data.filter((assets) =>
          assets.asset_name.toLowerCase().includes(currRef.toLowerCase())
        )
      );
    }
  }

  const QRFeedbackImg = ({ loc_id }: { loc_id: number | null }) => {
    const { SVG } = useQRCode();
    const location = plantLocs.filter((loc) => loc.id === loc_id)[0].location;
    console.log(location);
    function downloadQR(e: React.MouseEvent<HTMLButtonElement>) {
      const svg = e.currentTarget.querySelector("svg");

      if (!svg) return;
      console.log("downloading", location);

      saveSvg(svg, location + ".svg");
    }
    return (
      <button
        className={"btn btn-secondary " + styles.btnQr}
        onClick={downloadQR}
      >
        <SVG
          text={window.location.origin + "/Guest/Feedback/" + loc_id}
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
                console.log(selectedPlant);
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
                    filteredAssets.map((asset, i) => (
                      <option key={asset.psa_id} value={i}>
                        {asset.asset_name}
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
