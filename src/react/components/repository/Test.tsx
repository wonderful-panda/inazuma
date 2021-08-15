import { AlertType } from "@/context/AlertContext";
import { useAlert } from "@/hooks/useAlert";
import { useDispatch, useSelector } from "@/store";
import { ADD_TAB, CLOSE_REPOSITORY, TabType } from "@/store/repository";
import { Button, withStyles } from "@material-ui/core";
import { useCallback, useState } from "react";
import styled from "styled-components";
import { SplitterDirection } from "../Splitter";
import SplitterPanel from "../SplitterPanel";
import { TabDefinition } from "../TabContainer";
import CommitLog from "./CommitLog";

const StyledButton = withStyles({
  root: {
    margin: "0.5rem"
  }
})(Button);

const Content = styled.div`
  flex: 1;
  margin: 0.5rem;
  padding: 0.5rem;
  border: gray 1px solid;
`;

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
  const [direction, setDirection] = useState<SplitterDirection>("horiz");
  return (
    <SplitterPanel
      direction={direction}
      splitterThickness={5}
      ratio={ratio}
      allowDirectionChange
      onUpdateRatio={setRatio}
      onUpdateDirection={setDirection}
      first={
        <Content>
          <h2>{`${tab.type}:${tab.title}`}</h2>
          <StyledButton key="add-tab" variant="outlined" onClick={addTab}>
            ADD TAB
          </StyledButton>
          <StyledButton key="close" variant="outlined" onClick={closeRepository}>
            CLOSE
          </StyledButton>
          <br />
          {(["info", "success", "warning", "error"] as const).map((type) => (
            <StyledButton key={type} variant="outlined" onClick={() => showAlert(type)}>
              {type.toUpperCase()}
            </StyledButton>
          ))}
        </Content>
      }
      second={<CommitLog commits={commits} graph={graph} refs={refs} />}
    />
  );
};

export default Test;
