abstract class BaseIPProvider {
  abstract query(): Promise<string | null>;
}

export default BaseIPProvider;
