install-deps:
	@echo " > \033[32mInstalling dependencies... \033[0m "
	./scripts/install_deps.sh

install-cli: compile
	@echo " > \033[32mInstalling cb-sol-cli... \033[0m "
	npm link ./cli 

compile:
	@echo " > \033[32mCompiling contracts... \033[0m "
	npx truffle compile