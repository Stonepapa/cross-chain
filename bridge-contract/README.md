# bridge contracts

## Install Dependencies

    make install-deps

## Compile

    make compile

## Contracts

1. deploy Bridge contract
2. deploy handler contracts (ERC20Handler, ERC721Handler)
3. deploy asset contracts (ERC20 asset, ERC721 asset)
4. register resource of different handler on bridge
5. set asset burnable/isETH
6. set access role
7. set fee
8. do deposit and cross chain