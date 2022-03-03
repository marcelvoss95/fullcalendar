import {
  createElement,
  DateProfileGenerator, DateProfile,
  DayHeader,
  DaySeriesModel,
  DayTableModel,
  memoize,
  ChunkContentCallbackArgs,
} from '@fullcalendar/common'
import { DayTable } from '@fullcalendar/daygrid'
import { TimeColsView } from './TimeColsView'
import { DayTimeCols } from './DayTimeCols'
import { buildSlatMetas } from './time-slat-meta'

export class DayTimeColsView extends TimeColsView {
  private buildTimeColsModel = memoize(buildTimeColsModel)
  private buildSlatMetas = memoize(buildSlatMetas)

  render() {
    let { options, dateEnv, dateProfileGenerator } = this.context
    let { props } = this
    let { dateProfile } = props
    let dayTableModel = this.buildTimeColsModel(dateProfile, dateProfileGenerator)

    const splitterKeys = {
      timed: {},
    };

    options.allDayCategories.forEach((p: any) => splitterKeys[p] = {})
    this.allDaySplitter.setKeys(splitterKeys)

    let splitProps = this.allDaySplitter.splitProps(props)
    let slatMetas = this.buildSlatMetas(
      dateProfile.slotMinTime,
      dateProfile.slotMaxTime,
      options.slotLabelInterval,
      options.slotDuration,
      dateEnv,
    )
    let { dayMinWidth } = options
    let hasAttachedAxis = !dayMinWidth
    let hasDetachedAxis = dayMinWidth

    let headerContent = options.dayHeaders && (
      <DayHeader
        dates={dayTableModel.headerDates}
        dateProfile={dateProfile}
        datesRepDistinctDays
        renderIntro={hasAttachedAxis ? this.renderHeadAxis : null}
      />
    )

    let allDayContent = {};

    for (let key of Object.keys(splitProps)) {
      if (key === 'timed' || !options.allDaySlot) {
        continue;
      }

      allDayContent[key] = ((contentArg: ChunkContentCallbackArgs) => {
        return (
          <DayTable
            {...splitProps[key]}
            dateProfile={dateProfile}
            dayTableModel={dayTableModel}
            nextDayThreshold={options.nextDayThreshold}
            tableMinWidth={contentArg.tableMinWidth}
            colGroupNode={contentArg.tableColGroupNode}
            renderRowIntro={hasAttachedAxis ? this.renderTableRowAxis : null}
            showWeekNumbers={false}
            expandRows={false}
            headerAlignElRef={this.headerElRef}
            clientWidth={contentArg.clientWidth}
            clientHeight={contentArg.clientHeight}
            forPrint={props.forPrint}
            {...this.getAllDayMaxEventProps()}
          />
        );
      })
    }

    let timeGridContent = (contentArg: ChunkContentCallbackArgs) => (
      <DayTimeCols
        {...splitProps.timed}
        dayTableModel={dayTableModel}
        dateProfile={dateProfile}
        axis={hasAttachedAxis}
        slotDuration={options.slotDuration}
        slatMetas={slatMetas}
        forPrint={props.forPrint}
        tableColGroupNode={contentArg.tableColGroupNode}
        tableMinWidth={contentArg.tableMinWidth}
        clientWidth={contentArg.clientWidth}
        clientHeight={contentArg.clientHeight}
        onSlatCoords={this.handleSlatCoords}
        expandRows={contentArg.expandRows}
        onScrollTopRequest={this.handleScrollTopRequest}
      />
    )

    return hasDetachedAxis
      ? this.renderHScrollLayout(
        headerContent,
        allDayContent,
        timeGridContent,
        dayTableModel.colCnt,
        dayMinWidth,
        slatMetas,
        this.state.slatCoords,
      )
      : this.renderSimpleLayout(
        headerContent,
        allDayContent[0],
        timeGridContent,
      )
  }
}

export function buildTimeColsModel(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator) {
  let daySeries = new DaySeriesModel(dateProfile.renderRange, dateProfileGenerator)

  return new DayTableModel(daySeries, false)
}
