import React from "react";
import {
    ModuleContent,
    ModuleDivider,
    ModuleFooter,
    ModuleHeader,
    ModuleMain,
} from "../../../components";
import Link from "next/link";
import AssetSelect from "../../../components/Checklist/AssetSelect";
import formStyles from "../../../styles/formStyles.module.css";

const ChangeOfPartsNew = () => {
    return (
        <ModuleMain>
            <ModuleHeader title="New Change Of Parts" header="Create New Change Of Parts">
                <Link href="/ChangeOfParts" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <ModuleContent includeGreyContainer grid>
                    <div className={formStyles.halfContainer}>
                        <div className="form-group">
                            <label className="form-label">Linked Assets</label>
                            <AssetSelect onChange={(values) => {}} plantId={3} isMulti={false} />
                        </div>
                    </div>
                </ModuleContent>
                <ModuleFooter>
                    {/* new request not filled */}
                    {/* {(errors.requestTypeID || errors.faultTypeID || errors.taggedAssetID) && (
                        <span style={{ color: "red" }}>Please fill in all required fields</span>
                    )} */}
                    {/* assign request not filled */}
                    {/* {props.assignRequestData && assignNotFilled && (
                        <span style={{ color: "red" }}>
                            Please assign a user and set priority for the request
                        </span>
                    )} */}
                    <button type="submit" className="btn btn-primary">
                        <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                            style={{ marginRight: "0.5rem" }}
                        />
                        Submit
                    </button>
                </ModuleFooter>
            </ModuleContent>
        </ModuleMain>
    );
};

export default ChangeOfPartsNew;
