import React, { useState, useEffect } from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../components";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { CMMSChangeOfParts } from "../../types/common/interfaces";
import PlantSelect from "../../components/PlantSelect";
import { AiOutlineEdit } from "react-icons/ai";
import { VscNewFile } from "react-icons/vsc";
import TooltipBtn from "../../components/TooltipBtn";
import COPTable from "../../components/ChangeOfParts/COPTable";
import { useRouter } from "next/router";
import { createChangeOfPartsServerSideProps } from "../../types/common/props";
import { useChangeOfParts } from "../../components/SWR";
import { useCurrentUser } from "../../components/SWR";
import Pagination from "../../components/Pagination";
import instance from "../../types/common/axios.config";
import { Role } from "../../types/common/enums";

export interface ChangeOfPartsPageProps {
  changeOfParts: CMMSChangeOfParts[];
  filter: boolean;
  activeCOPType: number;
}

const indexedColumn: ("scheduled" | "completed")[] = ["scheduled", "completed"];

const ChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
  const [COPData, setCOPData] = useState<CMMSChangeOfParts[]>(
    props.changeOfParts
  );
  const [selectedPlant, setSelectedPlant] = useState<number>();
  const [selectedCOP, setSelectedCOP] = useState<CMMSChangeOfParts>(
    {} as CMMSChangeOfParts
  );
  const [activeCOPType, setActveCOPType] = useState<number>(props?.filter ? props.activeCOPType : 0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(0);

  const PAGE_LIMIT = 10;
  const router = useRouter();
  const user = useCurrentUser();
  const { userPermission } = useCurrentUser();

  const updatePlant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsReady(false);
    setSelectedPlant(+e.target.value);
  };

  const switchColumns = (activeIndex: number) => {
    setIsReady(false);
    setActveCOPType(activeIndex);
    setPage(1);
  };

  const { data, error, isValidating, mutate } = useChangeOfParts(
    null,
    PAGE_LIMIT,
    page,
    {
      type: indexedColumn[activeCOPType],
      plant_id: selectedPlant,
    }
  );

  useEffect(() => {
    const currTab = activeCOPType == 0 ? "scheduled" : "completed";
    instance.get(`/api/changeOfParts/${currTab}`).then((ele) => {
      const size = Math.ceil(ele.data.length / PAGE_LIMIT);
      setTotalPage(size);
    });
  }, [activeCOPType]);

  useEffect(() => {
    if (!isReady && data && !isValidating) {
      if (data.length > 0) {
        setCOPData(data);
        // console.log(data);
      } else {
        setCOPData([]);
      }
      setIsReady(true);
    }
  }, [data, isValidating, isReady]);

  useEffect(() => {
    if (user.data?.allocated_plants.length == 1)
      setSelectedPlant(user.data?.allocated_plants[0]);
  }, [user.data?.allocated_plants]);

  return (
    <ModuleMain>
      <ModuleHeader header="Change of Parts">
        { userPermission('canCreateChangeOfParts') && <TooltipBtn
          text="Create new"
          onClick={() => router.push("/ChangeOfParts/New")}
        >
          <VscNewFile size={22} />
        </TooltipBtn>}

        { userPermission('canEditChangeOfParts') &&
        <TooltipBtn
          text="Edit"
          disabled={(!selectedCOP.copId || selectedCOP.changedDate) as boolean}
          onClick={() =>
            router.push("/ChangeOfParts/Edit/" + selectedCOP.copId)
          }
        >
          <AiOutlineEdit size={22} />
        </TooltipBtn>
        }

        {!props?.filter && <PlantSelect onChange={updatePlant} allPlants accessControl default />}
      </ModuleHeader>
      <ModuleContent>
        <COPTable
          changeOfParts={COPData}
          setSelectedCOP={setSelectedCOP}
          selectedCOP={selectedCOP}
          isDisabledSelect={false}
          activeCOPType={activeCOPType}
          switchColumns={props?.filter ? null : switchColumns}
          display={isReady}
          filter={props?.filter}
        />
        {COPData.length === 0 &&
          (activeCOPType === 0 ? (
            <p>No Scheduled Change of Parts</p>
          ) : (
            <p>No Completed Change of Parts</p>
          ))}
      </ModuleContent>
      <Pagination
        page={page}
        setPage={setPage}
        totalPages={totalPage}
        setReady={setIsReady}
      />
    </ModuleMain>
  );
};

export default ChangeOfPartsPage;

export const getServerSideProps: GetServerSideProps =
  createChangeOfPartsServerSideProps(false);
