BASEDIR := $(abspath .)
SRCDIR := ${BASEDIR}/src
BUILDDIR := ${BASEDIR}/build
DISTDIR := dist
HI = humaninput
PLUGINS = $(notdir $(basename $(wildcard plugins/*.js)))
VERSION := $(shell cat version.txt)
UGLIFYARGS = --mangle --screw-ie8 --lint

ifeq (, $(shell which uglifyjs))
 $(error "You need uglifyjs to build HumanInput.  This might fix the problem: sudo apt-get install node-uglify")
endif

all:
	mkdir -p ${BUILDDIR} ${DISTDIR} ${DISTDIR}/plugins
	# Update the version string in everything
	sed -e "/VERSION/s/\".*\"/\"${VERSION}\"/g" ${SRCDIR}/${HI}.js > ${BUILDDIR}/${HI}.js
	# Copy all the plugins as-is to the dist directory in case folks want to make their own custom package
	$(foreach f, $(PLUGINS), cp plugins/$(f).js ${DISTDIR}/plugins/$(f).js;)
	$(foreach f, $(PLUGINS), uglifyjs -r HumanInput plugins/$(f).js ${UGLIFYARGS} > ${DISTDIR}/plugins/$(f).min.js;)
	cp ${BUILDDIR}/${HI}.js ${BUILDDIR}/${HI}-full.js # This copy will include the plugins
	$(foreach f, $(PLUGINS), cat plugins/$(f).js >> ${BUILDDIR}/${HI}-full.js;)
	# Create the basic HumanInput lib:
	cp ${BUILDDIR}/${HI}.js ${DISTDIR}/${HI}-${VERSION}.js
	cp ${BUILDDIR}/${HI}-full.js ${DISTDIR}/${HI}-${VERSION}-full.js
	uglifyjs -r HumanInput ${BUILDDIR}/${HI}.js ${UGLIFYARGS} > ${DISTDIR}/${HI}-${VERSION}.min.js
	# Now make the same thing but with debug lines removed:
	# Make a minified version with all plugins included:
	uglifyjs -r HumanInput ${BUILDDIR}/${HI}-full.js ${UGLIFYARGS} > ${BUILDDIR}/${HI}-full.min.js
	cp ${BUILDDIR}/${HI}-full.min.js ${DISTDIR}/${HI}-${VERSION}-full.min.js
	# Make symlinks to the latest version in the main directory
	ln -sf ${DISTDIR}/${HI}-${VERSION}-full.js ${HI}-latest.js
	ln -sf ${DISTDIR}/${HI}-${VERSION}-full.min.js ${HI}-latest.min.js
	# Lastly make a version with all plugins but with debug lines removed (for minification extremists)


clean:
	rm -rf ${BUILDDIR}
	rm -rf ${DISTDIR}
