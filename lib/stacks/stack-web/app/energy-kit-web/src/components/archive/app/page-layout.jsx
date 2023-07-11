import React from "react"
import { useHistory } from "react-router-dom"
import Column from "../../../front_end_library/@amzn/meridian/column"
import Heading from "../../../front_end_library/@amzn/meridian/heading"
import Breadcrumb, { BreadcrumbGroup } from "../../../front_end_library/@amzn/meridian/breadcrumb"
import Loader from "../../../front_end_library/@amzn/meridian/loader"

const PageLayout = ({
  children,
  title,
  loading,
  breadcrumbs = [],
  spacing = "large",
}) => {
  const history = useHistory()
  return (
    <Column alignmentHorizontal="center" spacingInset="large large xlarge">
      <Column width={1400} maxWidth="100%" spacing={spacing}>
        {breadcrumbs.length > 0 ? (
          <BreadcrumbGroup>
            {breadcrumbs.map(({ title, path }) => (
              <Breadcrumb key={path} href={path} onClick={history.push}>
                {title}
              </Breadcrumb>
            ))}
            <Breadcrumb>{title}</Breadcrumb>
          </BreadcrumbGroup>
        ) : null}
        {title ? (
          <Heading level={1} type="d100" fontFamily="bookerly">
            {title}
          </Heading>
        ) : null}
        {loading ? (
          <Column alignmentHorizontal="center" spacingInset="xlarge none">
            <Loader type="circular" />
          </Column>
        ) : (
          children
        )}
      </Column>
    </Column>
  )
}

export default PageLayout