BASEDIR := $(abspath .)
BUILDDIR := ${BASEDIR}/build
DISTDIR := ${BASEDIR}/dist
HI = humaninput
PLUGINS = $(notdir $(basename $(wildcard plugins/*.js)))
VERSION := $(shell cat version.txt)
UGLIFYARGS = --mangle --screw-ie8 --lint

ifeq (, $(shell which uglifyjs))
 $(error "You need uglifyjs to build HumanInput.  This might fix the problem: sudo apt-get install node-uglify")
endif

all:
	mkdir -p ${BUILDDIR} ${DISTDIR}
	$(foreach f, $(PLUGINS), uglifyjs plugins/$(f).js ${UGLIFYARGS} > ${BUILDDIR}/$(f).min.js;)
# 	cp ${HI}.js ${DISTDIR}/${HI}-${VERSION}.js # Copy as-is
	cp ${HI}.js ${BUILDDIR}/${HI}-full.js # This copy will include the plugins
	$(foreach f, $(PLUGINS), cat plugins/$(f).js >> ${BUILDDIR}/${HI}-full.js;)
	grep -v "self.log.debug(" ${HI}.js | grep -v "^$$" > ${BUILDDIR}/${HI}-nodebug.js
	grep -v "self.log.debug(" ${BUILDDIR}/${HI}-full.js | grep -v "^$$" > ${BUILDDIR}/${HI}-full-nodebug.js
	# Create the basic HumanInput lib:
	cp ${BUILDDIR}/${HI}-full.js ${DISTDIR}/${HI}-${VERSION}-full.js
	uglifyjs ${HI}.js ${UGLIFYARGS} > ${BUILDDIR}/${HI}.min.js
	# Now make the same thing but with debug lines removed:
	uglifyjs ${BUILDDIR}/${HI}-nodebug.js ${UGLIFYARGS} > ${BUILDDIR}/${HI}-nodebug.min.js
	# Make a minified version with all plugins included:
	uglifyjs ${BUILDDIR}/${HI}-full.js ${UGLIFYARGS} > ${BUILDDIR}/${HI}-full.min.js
	# Lastly make a version with all plugins but with debug lines removed
	uglifyjs ${BUILDDIR}/${HI}-full-nodebug.js ${UGLIFYARGS} > ${DISTDIR}/${HI}-${VERSION}-full-nodebug.min.js
	cp ${BUILDDIR}/${HI}.min.js ${DISTDIR}/${HI}-${VERSION}.min.js
	cp ${BUILDDIR}/${HI}-full.min.js ${DISTDIR}/${HI}-${VERSION}-full.min.js
# 	$(foreach f, $(PLUGINS), cat ${BUILDDIR}/$(f).min.js > ${DISTDIR}/$(f).min.js;)
# 	$(foreach f, $(PLUGINS), cat ${BUILDDIR}/$(f).min.js >> ${DISTDIR}/${HI}-${VERSION}-full.min.js;)

clean:
	rm -rf ${BUILDDIR}
	rm -rf ${DISTDIR}
