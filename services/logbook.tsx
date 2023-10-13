import instance from "../types/common/axios.config";

// Get All logbook labels query
const getLogbookLabels = async () => {
    try {
        return await instance
            .get("/api/logbook_labels")
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                console.log("Retrieve logbook labels failed: " + err);
            });
        }
    catch (error) {
        console.log("Error:" + error);
    }
};


const logbookService = {
    getLogbookLabels,
};

export { logbookService as default };