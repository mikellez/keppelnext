import instance from "../types/common/axios.config";


// get asset details query
const getAsset = async (id: number) => {
    try {
        const url = "/api/assetDetails/";
        return await instance.get(url + id)
            .then((res) => {
                return res.data[0];
            }).catch((error) => {
                console.log("Retrieve Asset failed: " + error);
            })
        }
      catch (error) {
        console.log("Error:" + error);
    }
}

// get assets hierachy query
const getAssets = async () => {
    try {
        return await instance
            .get("/api/asset")
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                console.log("Retrieve Asset failed: " + err);
            });
        }
    catch (error) {
        console.log("Error:" + error);
    }
};


const assetService = {
    getAsset,
    getAssets,
};

export { assetService as default };