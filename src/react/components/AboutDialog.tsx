import { useCallback, useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { version } from "../../../package.json";
import { sha } from "@/generated/gitinfo.json";
import { CancelButton, DialogActions, DialogContent, DialogTitle } from "@/components/Dialog";
import { useDialog } from "@/context/DialogContext";
import { convertFileSrc } from "@tauri-apps/api/core";

export const useAboutDialog = () => {
  const dialog = useDialog();
  return useCallback(async () => {
    return dialog.showModal({
      content: <AboutDialogBody />,
      defaultActionKey: "Enter",
      fullscreen: true
    });
  }, [dialog]);
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      className="flex-1"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && children}
    </div>
  );
};

const rustLicensesUrl = convertFileSrc("rust-licenses.html", "static");
const jsLicensesUrl = convertFileSrc("js-licenses.html", "static");

export const AboutDialogBody: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <DialogTitle>ABOUT</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="license tabs">
            <Tab label="General" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
            <Tab label="Frontend Licenses" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
            <Tab label="Backend Licenses" id="simple-tab-2" aria-controls="simple-tabpanel-2" />
          </Tabs>
        </Box>
        
        <Box sx={{ display: "flex", flex: 1, mt: 1 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ m: 2 }}>
              Inazuma {version} ({sha})
            </Box>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <iframe
              src={jsLicensesUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '4px'
              }}
              title="Frontend Dependencies Licenses"
            />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <iframe
              src={rustLicensesUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '4px'
              }}
              title="Backend Dependencies Licenses"
            />
          </TabPanel>
        </Box>
      </DialogContent>
      <DialogActions>
        <CancelButton />
      </DialogActions>
    </>
  );
};
