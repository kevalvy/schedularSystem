import moment from "moment-timezone";


export default function compereDate(date){
    
const dateToCompare = moment(date); // your input date
const now = moment();
    if (!dateToCompare.isBefore(now)) {
  return true
} else {
    return false
}

}