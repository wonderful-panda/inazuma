import { AlertType } from "@/context/AlertContext";
import { useAlert } from "@/hooks/useAlert";
import { useDispatch, useSelector } from "@/store";
import { ADD_TAB, CLOSE_REPOSITORY, TabType } from "@/store/repository";
import { Button } from "@material-ui/core";
import { useCallback, useState } from "react";
import SplitterPanel from "../SplitterPanel";
import { TabDefinition } from "../TabContainer";
import CommitList from "./CommitList";

const Test: React.VFC<{ tab: TabDefinition<TabType> }> = ({ tab }) => {
  const alert = useAlert();
  const commits = useSelector((state) => state.repository.commits);
  const graph = useSelector((state) => state.repository.graph);
  const refs = useSelector((state) => state.repository.refs);
  const dispatch = useDispatch();
  const addTab = useCallback(() => {
    const id = Date.now().toString();
    dispatch(
      ADD_TAB({
        type: "file",
        id,
        title: `TAB-${id}`,
        payload: { path: "XXX", sha: "XXXX" },
        closable: true
      })
    );
  }, []);
  const closeRepository = useCallback(() => dispatch(CLOSE_REPOSITORY()), []);
  const showAlert = useCallback((type: AlertType) => alert.show(type, `This is ${type} message`), [
    alert
  ]);
  const [ratio, setRatio] = useState(0.4);
  const [direction, setDirection] = useState<Direction>("horiz");
  return (
    <SplitterPanel
      direction={direction}
      splitterThickness={5}
      ratio={ratio}
      allowDirectionChange
      onUpdateRatio={setRatio}
      onUpdateDirection={setDirection}
      first={
        <div className="flex-1 m-2 p-2 border border-solid border-greytext">
          <h2>{`${tab.type}:${tab.title}`}</h2>
          <Button className="m-2" key="add-tab" variant="outlined" onClick={addTab}>
            ADD TAB
          </Button>
          <Button className="m-2" key="close" variant="outlined" onClick={closeRepository}>
            CLOSE
          </Button>
          <br />
          {(["info", "success", "warning", "error"] as const).map((type) => (
            <Button className="m-2" key={type} variant="outlined" onClick={() => showAlert(type)}>
              {type.toUpperCase()}
            </Button>
          ))}
        </div>
      }
      second={<CommitList selectedIndex={0} commits={commits} graph={graph} refs={refs} />}
    />
  );
};

export default Test;
