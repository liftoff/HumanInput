BASEDIR := $(abspath .)
SRCDIR := ${BASEDIR}/src
BUILDDIR := ${BASEDIR}/build
DISTDIR := dist
HI = humaninput
PLUGINS = $(notdir $(basename $(wildcard plugins/*.js)))
VERSION := $(shell cat version.txt)

ifeq (, $(shell which npm))
 $(error "You need npm and uglifyjs to build HumanInput.  This might fix the problem: sudo apt-get install node-uglify")
endif

ifeq (, $(shell which webpack))
 $(error "You need webpack 2.0.0+ to build HumanInput.  This might fix the problem: sudo npm install -g webpack@2.1.0-beta.15")
endif

all: doall dev prod

doall:
	@echo "\033[1mBuilding both DEVELOPMENT *and* PRODUCTION versions...\033[0m"
	@echo ""

prod:
	@echo "\033[1mMaking PRODUCTION version (minified)\033[0m"
	@mkdir -p ${BUILDDIR} ${DISTDIR}
	@ # Make the 'lib' version for use with node-style development:
	@echo "\033[32;1mTranspiling via babel src->lib\033[0m"
	@babel src --out-dir lib --plugins add-module-exports,transform-es2015-modules-umd
	@echo "\033[32;1mCreating dist via webpack\033[0m"
	@PROD_ENV=1 HI_VERSION="${VERSION}" webpack
	@cp ${BUILDDIR}/${HI}-full.min.js ${DISTDIR}/${HI}-full.min.js
	@cp ${BUILDDIR}/${HI}-full.min.js ${DISTDIR}/${HI}-${VERSION}-full.min.js
	@cp ${BUILDDIR}/${HI}.min.js ${DISTDIR}/${HI}-${VERSION}.min.js
	@ln -sf ${DISTDIR}/${HI}-${VERSION}-full.min.js ${HI}-latest.min.js
	@gzip -kf ${DISTDIR}/${HI}-${VERSION}.min.js ${DISTDIR}/${HI}-${VERSION}-full.min.js
	@echo ""
	@echo "\033[44;1m           Gzipped File Sizes            \033[0m"
	@echo "\033[44;1m \033[0m  ${HI}-${VERSION}-full.min.js\t  `ls -lh ${DISTDIR}/${HI}-${VERSION}-full.min.js.gz | cut -d' ' -f5`\t\033[44;1m \033[0m"
	@echo "\033[44;1m \033[0m  ${HI}-${VERSION}.min.js\t  `ls -lh ${DISTDIR}/${HI}-${VERSION}.min.js.gz | cut -d' ' -f5`\t\033[44;1m \033[0m"
	@echo "\033[44;1m                                         \033[0m"

dev:
	@echo "\033[1mMaking DEVELOPMENT version (not minified)\033[0m"
	@mkdir -p ${BUILDDIR} ${DISTDIR}
	@HI_VERSION="${VERSION}" webpack
	@cp ${BUILDDIR}/${HI}-full.js ${DISTDIR}/${HI}-${VERSION}-full.js
	@cp ${BUILDDIR}/${HI}.js ${DISTDIR}/${HI}-${VERSION}.js
	@ln -sf ${DISTDIR}/${HI}-${VERSION}-full.js ${HI}-latest.js

clean:
	@rm -rf ${BUILDDIR}
	@rm -rf ${DISTDIR}
