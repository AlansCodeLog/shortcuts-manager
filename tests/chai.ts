import { partialDeepEqual } from "@utils/testing"
import chai from "chai"


chai.use(partialDeepEqual)
// eslint-disable-next-line import/no-default-export
export default chai
export const expect = chai.expect
