import { partial_deep_equal } from "@utils/testing"
import chai from "chai"


chai.use(partial_deep_equal)
// eslint-disable-next-line import/no-default-export
export default chai
export const expect = chai.expect
