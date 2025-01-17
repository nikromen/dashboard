import React, { useState, useEffect } from "react";
import {
    PageSection,
    PageSectionVariants,
    Text,
    Tabs,
    Tab,
    Title,
    TabTitleText,
    Card,
    CardBody,
    Divider,
    TextContent,
    Label,
} from "@patternfly/react-core";

import PullRequestList from "./pr";
import BranchList from "./branch";
import IssuesList from "./issues";
import ReleasesList from "./releases";
import ConnectionError from "./error";
import Preloader from "./preloader";
import ForgeIcon from "./forge_icon";

import { ExternalLinkAltIcon } from "@patternfly/react-icons";

const ProjectInfo = (props) => {
    let forge = props.match.params.forge;
    let namespace = props.match.params.namespace;
    let repoName = props.match.params.repoName;

    const [activeTabKey, setActiveTabKey] = React.useState(0);
    const [hasError, setErrors] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isValidProject, setValidProject] = React.useState(false);
    const [projectURL, setProjectURL] = React.useState("");
    const handleTabClick = (event, tabIndex) => {
        setActiveTabKey(tabIndex);
    };

    function checkValidProject() {
        fetch(
            `${process.env.REACT_APP_API_URL}/projects/${forge}/${namespace}/${repoName}`
        )
            .then((response) => response.json())
            .then((data) => {
                if (!data.error) {
                    setValidProject(true);
                    setProjectURL(data.project_url);
                }
                setLoaded(true);
            })
            .catch((err) => {
                console.log(err);
                setErrors(err);
            });
    }

    // Executes checkValidProject on first render of component
    useEffect(() => {
        checkValidProject();
    }, []);

    let details = <div></div>;

    if (isValidProject && loaded) {
        details = (
            <div>
                <Tabs
                    isFilled
                    activeKey={activeTabKey}
                    onSelect={handleTabClick}
                    isBox={true}
                >
                    <Tab
                        eventKey={0}
                        title={<TabTitleText>PRs Handled</TabTitleText>}
                    >
                        <PullRequestList
                            repoName={repoName}
                            namespace={namespace}
                            forge={forge}
                        />
                    </Tab>
                    <Tab
                        eventKey={1}
                        title={<TabTitleText>Releases Handled</TabTitleText>}
                    >
                        <ReleasesList
                            repoName={repoName}
                            namespace={namespace}
                            forge={forge}
                        />
                    </Tab>
                    <Tab
                        eventKey={2}
                        title={<TabTitleText>Branches Handled</TabTitleText>}
                    >
                        <BranchList
                            repoName={repoName}
                            namespace={namespace}
                            forge={forge}
                        />
                    </Tab>
                    <Tab
                        eventKey={3}
                        title={<TabTitleText>Issues Handled</TabTitleText>}
                    >
                        <IssuesList
                            repoName={repoName}
                            namespace={namespace}
                            forge={forge}
                        />
                    </Tab>
                </Tabs>
            </div>
        );
    } else if (!isValidProject && loaded) {
        details = (
            <Title headingLevel="h1" size="lg">
                Not Found.
            </Title>
        );
    } else if (!loaded) {
        details = <Preloader />;
    }

    // If backend API is down
    if (hasError) {
        return <ConnectionError />;
    }

    return (
        <div>
            <PageSection variant={PageSectionVariants.light}>
                <TextContent>
                    <Text component="h1">{`${namespace}/${repoName}`}</Text>
                    <Text component="p">
                        <Label
                            color="blue"
                            icon={<ForgeIcon url={projectURL} />}
                        >
                            {forge}
                        </Label>
                        <span style={{ marginLeft: "10px" }}>
                            <ProjectLink link={projectURL} />
                        </span>
                    </Text>
                </TextContent>
            </PageSection>
            <PageSection>
                <Card>
                    <CardBody>{details}</CardBody>
                </Card>
            </PageSection>
        </div>
    );
};

const ProjectLink = (props) => {
    const handleClick = () => window.open(props.link, "_blank");
    if (props.link === "") {
        return "";
    }
    return <ExternalLinkAltIcon onClick={handleClick} />;
};

export { ProjectInfo };
