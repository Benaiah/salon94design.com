import React, { Component } from 'react'
import Helmet from 'react-helmet'
import Link from 'gatsby-link'
import styled from 'emotion/react'

import { createPanes, PageContainer } from '../layouts/containers'
import {
  sansfont,
  monofont,
  childLink,
  Header1,
  breakpoint1,
} from '../layouts/emotion-base'
import ImageList from '../layouts/ImageList'
import HoverInfo from '../layouts/HoverInfo'
import HiddenSelector from '../layouts/HiddenSelector'
import WorkSummary from '../layouts/WorkSummary'
import {
  workImagePath,
  designerLink,
  projectLink,
  workImageTexts,
} from '../util'

const { LeftPane, RightPane } = createPanes()

const ProjectHeader = styled.div`
  composes: ${sansfont};
  margin-bottom: 40px;
`

const ProjectDesigner = styled.span`
  composes: ${childLink};

  &:not(:first-child)::before {
    content: " / ";
  }

  &:last-child::after {
    content: " ";
  }
`

const ProjectWhen = styled.div`
  composes: ${monofont};
  margin-top: 8px;
  font-size: 24px;
`

const ProjectDescription = styled.div`
  max-width: 320px;
  font-size: 20px;
  font-weight: 300;
  line-height: 1.4;

  @media (${breakpoint1}) {
    max-width: 480px;
  }
`

export default class ProjectTemplate extends Component {
  constructor(props) {
    super(props)

    this.imageHoverHandler = this.imageHoverHandler.bind(this)

    this.state = {
      hoverImage: null,
    }
  }

  imageHoverHandler(hoverImage) {
    this.setState({ hoverImage: hoverImage || null })
  }

  render() {
    const { data, pathContext } = this.props
    const { allProjectsYaml, allDesignersYaml } = data
    const { slug: currentProjectSlug } = pathContext
    const { hoverImage } = this.state

    const projects = allProjectsYaml.edges.map(edge => edge.node)
    const currentProject = projects.find(p => p.slug === currentProjectSlug)

    const designers = allDesignersYaml.edges.map(edge => edge.node)
    const getDesigner = slug => designers.find(d => d.slug === slug)

    const workImages = []
    designers.forEach(designer => {
      const works = designer.works.filter(work =>
        work.projects.includes(currentProjectSlug)
      )

      works.forEach(work => {
        workImages.push({
          work,
          designer,
          src: workImagePath(work.images[0]),
          texts: workImageTexts({ work, designer }),
        })
      })
    })

    const images = []
    for (let i = 0; i < 10; i++) {
      // TODO: remove temporary image multiplication
      workImages.forEach(item => images.push(item))
    }

    const imageSets = [{ images }]

    const projectsByYear = Array.from(new Set(projects.map(p => p.when))) // years
      .sort((a, b) => b - a) // sort reverse-chronologically
      .map(year => ({ year, projects: projects.filter(p => p.when === year) }))

    const selectorSections = projectsByYear.map(({ year, projects }) => ({
      title: year,
      items: projects.map(project => ({
        title: project.title,
        link: projectLink(project.slug),
      })),
    }))

    return (
      <PageContainer>
        <Helmet
          title={`Salon 94 Design - Projects - ${currentProject.title}`}
        />
        <LeftPane>
          <ImageList
            imageSets={imageSets}
            onImageHover={this.imageHoverHandler}
          />
        </LeftPane>
        <RightPane className="selectable">
          <ProjectHeader>
            <Header1>
              {currentProject.title}
              <div className="subheader">
                {currentProject.designers.map(slug =>
                  <ProjectDesigner key={slug}>
                    <Link to={designerLink(slug)}>
                      {getDesigner(slug).name}
                    </Link>
                  </ProjectDesigner>
                )}
                <ProjectWhen>
                  {currentProject.when}
                </ProjectWhen>
              </div>
            </Header1>
            <ProjectDescription dangerouslySetInnerHTML={{ __html: currentProject.description }} />
          </ProjectHeader>
          <HiddenSelector
            title="All Projects"
            sections={selectorSections}
            currentItemLink={projectLink(currentProjectSlug)}
          />
          {hoverImage &&
            <HoverInfo>
              <WorkSummary
                work={hoverImage.work}
                designer={hoverImage.designer}
              />
            </HoverInfo>}
        </RightPane>
      </PageContainer>
    )
  }
}

export const pageQuery = graphql`
  query ProjectsTemplateQuery {
    allProjectsYaml {
      edges {
        node {
          slug
          title
          description
          when
          designers
        }
      }
    }
    allDesignersYaml {
      edges {
        node {
          slug
          name
          works {
            slug
            title
            when
            projects
            tags
            images
            caption
            price
          }
        }
      }
    }
  }
`
