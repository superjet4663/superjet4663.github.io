import { i18n } from "../../i18n"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
// @ts-ignore
import notFoundScript from "../scripts/404.inline"

const NotFound: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
  return (
    <>
      <br />
      <div class="home-tooltip">Click to return to the home page</div>
      <article class="popover-hint" data-slug="404">
        <h1>404</h1>
        <p>{i18n(cfg.locale).pages.error.notFound}</p>
      </article>
    </>
  )
}

NotFound.afterDOMLoaded = notFoundScript

export default (() => NotFound) satisfies QuartzComponentConstructor
