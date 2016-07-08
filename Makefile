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
	@PROD_ENV=1 HI_VERSION="${VERSION}" webpack
	@cp ${BUILDDIR}/${HI}-full.min.js ${DISTDIR}/${HI}-${VERSION}-full.min.js
	@cp ${BUILDDIR}/${HI}.min.js ${DISTDIR}/${HI}-${VERSION}.min.js
	@ln -sf ${DISTDIR}/${HI}-${VERSION}-full.min.js ${HI}-latest.min.js

dev:
	@echo "\033[1mMaking DEVELOPMENT version (not minified)\033[0m"
	@mkdir -p ${BUILDDIR} ${DISTDIR}
	@HI_VERSION="${VERSION}" webpack
	@cp ${BUILDDIR}/${HI}-full.js ${DISTDIR}/${HI}-${VERSION}-full.js
	@cp ${BUILDDIR}/${HI}.js ${DISTDIR}/${HI}-${VERSION}.js
	@ln -sf ${DISTDIR}/${HI}-${VERSION}-full.js ${HI}-latest.js

clean:
	rm -rf ${BUILDDIR}
	rm -rf ${DISTDIR}
