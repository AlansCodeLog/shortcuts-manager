{
  description = "";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { self
    , nixpkgs
    , flake-utils
    } @inputs:
    flake-utils.lib.eachDefaultSystem
      (system:
      let
        inherit (nixpkgs) lib;
        distDir = ".dist";
        pkgs = import nixpkgs
          {
            inherit system;
            config = { };
            overlays = [ ];
          };
        cwd = (builtins.toString ./.);
      in
      {

        devShells.default = pkgs.mkShell {
          packages = with pkgs;[
            nodejs_22
            nodejs_22.pkgs.pnpm
          ];
          shellHook = ''
            export NPM_TOKEN=$(cat $SECRETS_DIR/NPM_TOKEN)
            export GH_TOKEN=$(cat $SECRETS_DIR/GH_TOKEN)
            echo "node `${pkgs.nodejs}/bin/node --version`"
            echo "pnpm `${pkgs.nodePackages.pnpm}/bin/pnpm --version`"
          '';
        };
      });
}
