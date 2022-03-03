import {
  Splitter,
  hasBgRendering,
  EventDef,
  DateSpan,
} from '@fullcalendar/common'

export class AllDaySplitter extends Splitter {

  keys: any;

  setKeys(keys: any){
    this.keys = keys;
  }

  getKeyInfo() {
    if(this.keys) {
      return this.keys;
    }

    return {
      allDay: {},
      timed: {},
    }
  }

  getKeysForDateSpan(dateSpan: DateSpan): string[] {
    if (dateSpan.allDay) {
      return ['allDay']
    }

    return ['timed']
  }

  getKeysForEventDef(eventDef: EventDef): string[] {
    if (!eventDef.allDay) {
      return ['timed']
    }

    if (hasBgRendering(eventDef)) {
      return ['timed', 'allDay']
    }

    return [eventDef.extendedProps.category || 'all-day'];
  }
}
